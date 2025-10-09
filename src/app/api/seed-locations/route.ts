
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import { collection, writeBatch, getDocs, query, where } from 'firebase/firestore';

const indianCities = [
    { id: 101, name: "Mumbai", country: "India" },
    { id: 102, name: "Delhi", country: "India" },
    { id: 103, name: "Bengaluru", country: "India" },
    { id: 104, name: "Chennai", country: "India" },
    { id: 105, name: "Hyderabad", country: "India" },
    { id: 106, name: "Pune", country: "India" },
    { id: 107, name: "Kolkata", country: "India" },
    { id: 108, name: "Ahmedabad", country: "India" },
    { id: 109, name: "Jaipur", country: "India" },
    { id: 110, name: "Surat", country: "India" },
    { id: 111, name: "Lucknow", country: "India" },
    { id: 112, name: "Kanpur", country: "India" },
    { id: 113, name: "Nagpur", country: "India" },
    { id: 114, name: "Indore", country: "India" },
    { id: 115, name: "Thane", country: "India" },
    { id: 116, name: "Bhopal", country: "India" },
    { id: 117, name: "Visakhapatnam", country: "India" },
    { id: 118, name: "Noida", country: "India" },
    { id: 119, name: "Gurugram", country: "India" }
];

export async function GET(request: Request) {
  try {
    const locationsRef = db.collection('locations');
    const batch = db.batch();
    let citiesAdded = 0;

    // Check existing locations to avoid duplicates
    const q = query(collection(db, 'locations'), where('country', '==', 'India'));
    const existingIndianLocationsSnapshot = await getDocs(q);
    const existingLocationNames = new Set(existingIndianLocationsSnapshot.docs.map(doc => doc.data().name));

    for (const city of indianCities) {
      if (!existingLocationNames.has(city.name)) {
        // Use the city name as the document ID for simplicity and to prevent duplicates on re-runs.
        // Firestore IDs are strings, so we'll use the name.
        const docRef = locationsRef.doc(city.name.toLowerCase().replace(/ /g, '-'));
        batch.set(docRef, {
            id: city.id,
            name: city.name,
            country: city.country,
        });
        citiesAdded++;
      }
    }

    if (citiesAdded > 0) {
        await batch.commit();
        return NextResponse.json({ message: `${citiesAdded} Indian locations have been successfully added to Firestore.` }, { status: 200 });
    } else {
        return NextResponse.json({ message: 'Indian locations already exist in the database. No new locations were added.' }, { status: 200 });
    }

  } catch (e: any) {
    console.error("[API_SEED_LOCATIONS] Error:", e);
    return NextResponse.json({ error: 'Failed to seed locations', details: e.message }, { status: 500 });
  }
}
