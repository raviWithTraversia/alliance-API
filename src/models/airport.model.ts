import { Schema, model, Document } from 'mongoose';

// Define an interface for the airport document
interface IAirport extends Document {
  cityName: string;
  countryName: string;
  countryCode: string;
  countryCode3Letter: string;
  airportName: string;
  airportCode: string;
  cityCode: string;
  insGeoCode: number;
  continentName: string;
  continentCode: string;
  languageCode: string;
}

// Define the airport schema
const airportSchema = new Schema<IAirport>({
  cityName: { type: String, required: false },
  countryName: { type: String, required: false },
  countryCode: { type: String, required: false },
  countryCode3Letter: { type: String, required: false },
  airportName: { type: String, required: false },
  airportCode: { type: String, required: false },
  cityCode: { type: String, required: false },
  insGeoCode: { type: Number, required: false },
  continentName: { type: String, required: false },
  continentCode: { type: String, required: false },
  languageCode: { type: String, required: false },
});

// Create the airport model
const Airport = model<IAirport>('Airport', airportSchema);

export default Airport;
