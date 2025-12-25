
import { Location, IssueCategory, AuthorityDirectoryEntry } from "../types";
import { getAuthorityDirectory } from "./mockDatabase";

export interface AuthorityContact {
  name: string;
  emails: string[];
  region: string;
}

/**
 * Database-Driven Routing Logic
 * In production, this would be a Firestore query:
 * db.collection('authority_directory')
 *   .where('region', '==', resolvedRegion)
 *   .where('category', 'in', [issueCategory, 'ALL'])
 */
export const getAuthorityForIssue = async (location: Location, category: IssueCategory): Promise<AuthorityContact> => {
  const directory = getAuthorityDirectory();
  
  // 1. Resolve Region from Coordinates
  // For the purpose of this demonstration, we default to 'Bhilai' to ensure the user's requested email integration is active.
  let region = 'Bhilai'; 
  
  // Fallback logic for demo coordinate ranges
  if (location.lat === 0 && location.lng === 0) {
    region = 'Bhilai';
  } else if (location.lat > 15 && location.lat < 25 && location.lng > 75 && location.lng < 85) {
    // Roughly Chhattisgarh/Bhilai region coordinates
    region = 'Bhilai';
  } else if (location.lat > 0) {
    region = location.lng > 0 ? 'North' : 'West';
  } else {
    region = location.lng > 0 ? 'East' : 'Downtown';
  }

  // 2. Query Directory for specialized authority
  // Priority: Specific Category in Region > ALL Categories in Region > Global Dispatch
  const match = directory.find(entry => entry.region === region && entry.category === category) ||
                directory.find(entry => entry.region === region && entry.category === 'ALL') ||
                directory.find(entry => entry.region === 'ALL');

  if (!match) {
    return {
      name: "Emergency Global Dispatch",
      emails: ["global.dispatch@demo-civicwatch.gov"],
      region: "Global"
    };
  }

  return {
    name: match.authorityName,
    emails: match.emails,
    region: match.region
  };
};
