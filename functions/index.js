
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenAI } = require('@google/genai');
const nodemailer = require('nodemailer');

admin.initializeApp();

/**
 * PRODUCTION SECURITY: Auth Context Verification
 */
const verifyUserIsAuthorized = async (context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires identity verification.');
  }
  return context.auth.uid;
};

/**
 * PRODUCTION BACKEND FLOW: processCivicReport
 */
exports.processCivicReport = functions.firestore
  .document('reports/{reportId}')
  .onCreate(async (snap, context) => {
    const reportData = snap.data();
    const reportId = context.params.reportId;
    const db = admin.firestore();

    console.log(`[BACKEND] Validating identity for Report: ${reportId}`);

    try {
      // Security Check: In real Firebase, reportData would have a 'reportedBy' UID
      // We would verify this against the user record
      const userDoc = await db.collection('users').doc(reportData.reportedBy).get();
      if (!userDoc.exists) {
        console.warn(`[SECURITY] Unregistered user attempted reporting.`);
        return snap.ref.update({ status: 'REJECTED', error: 'Identity not recognized.' });
      }

      // 1. Initialize AI
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // 2. Perform Deep Analysis (if not already done by client)
      let analysis = reportData.analysis;
      if (!analysis) {
        const result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { text: "Analyze this road hazard. Provide category, severity (LOW to CRITICAL), technical description, and confidence score. Return JSON only." },
              { inlineData: { mimeType: "image/jpeg", data: reportData.image.split(',')[1] } }
            ]
          },
          config: { responseMimeType: "application/json" }
        });
        analysis = JSON.parse(result.text);
      }

      if (!analysis.isValidIssue) {
        return snap.ref.update({ status: 'REJECTED', reason: 'AI failed to verify hazard.' });
      }

      // 3. Database-Driven Routing
      const city = reportData.city || 'Bhilai';
      const authorityQuery = await db.collection('authority_directory')
        .where('region', '==', city)
        .where('category', 'in', [analysis.category, 'ALL'])
        .limit(1)
        .get();

      let authority = { name: 'Bhilai Municipal Corp', emails: ['sonaliupadhyay6020@gmail.com'] };
      if (!authorityQuery.empty) {
        authority = authorityQuery.docs[0].data();
      }

      // 4. Generate Formal AI Email
      const emailPrompt = `Generate a maintenance request for ${analysis.category} at [${reportData.location.lat}, ${reportData.location.lng}]. 
      City: ${city}. Severity: ${analysis.severity}. Tone: Formal Government Request. Include AI Confidence: ${analysis.confidenceScore}%.`;
      
      const emailResult = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: emailPrompt,
        config: {
          systemInstruction: "You are the CivicWatch AI Autonomous Dispatcher. Generate formal, concise, and high-stakes infrastructure hazard reports."
        }
      });
      const bodyText = emailResult.text;

      // 5. Secure Dispatch (GMAIL CONFIG)
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "sonaliupadhyay6020@gmail.com",
          pass: "YOUR_16_DIGIT_APP_PASSWORD"
        }
      });

      await transporter.sendMail({
        from: '"CivicWatch AI Dispatch" <sonaliupadhyay6020@gmail.com>',
        to: authority.emails.join(','),
        subject: `🚨 AI-Verified Road Safety Issue: ${analysis.category} | ${analysis.severity}`,
        text: bodyText
      });

      return snap.ref.update({
        analysis,
        status: 'ACKNOWLEDGED',
        emailSent: true,
        dispatchedAt: admin.firestore.FieldValue.serverTimestamp(),
        emailStatus: 'SENT',
        emailedTo: `${authority.name} (Direct Dispatch)`
      });

    } catch (error) {
      console.error(`[PIPELINE FAILURE]`, error);
      return snap.ref.update({ 
        status: 'REJECTED', 
        error: error.message,
        emailStatus: 'FAILED'
      });
    }
  });
