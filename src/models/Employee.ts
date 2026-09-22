import mongoose, { Document, Schema } from "mongoose";

export interface IEmployee extends Document {
  [key: string]: any;

  password: any;
  name: any;
  residentIdNumber: any;
  idVersion?: any;
  nationality?: any;
  birthCity?: any;
  birthCountry?: any;
  dateOfBirth?: any;
  maritalStatus?: any;
  sponsorshipTransfers?: any;
  religion?: any;
  occupation?: any;
  employer?: any;
  employerIdNumber?: any;
  issuePlace?: any;
  workPermit?: any;
  residentIdIssueDate?: any;
  residentIdExpiry?: any;
  sponsorName?: any;
  sponsorIdNumber?: any;

  avatarUrl?: any;
  avatarPublicId?: any;

  passport?: any;
  healthInsurance?: any;
  hajjDetails?: any;
  qrData?: any;

  iqamaImage?: any;
  iqamaPublicId?: any;

  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    password: {
      type: Schema.Types.Mixed,
      required: true,
      select: false,
    },

    name: Schema.Types.Mixed,
    residentIdNumber: {
      type: Schema.Types.Mixed,
      required: true,
      unique: true,
      index: true,
    },

    idVersion: Schema.Types.Mixed,
    nationality: Schema.Types.Mixed,
    birthCity: Schema.Types.Mixed,
    birthCountry: Schema.Types.Mixed,
    dateOfBirth: Schema.Types.Mixed,
    maritalStatus: Schema.Types.Mixed,
    sponsorshipTransfers: Schema.Types.Mixed,
    religion: Schema.Types.Mixed,
    occupation: Schema.Types.Mixed,
    employer: Schema.Types.Mixed,
    employerIdNumber: Schema.Types.Mixed,
    issuePlace: Schema.Types.Mixed,
    workPermit: Schema.Types.Mixed,
    residentIdIssueDate: Schema.Types.Mixed,
    residentIdExpiry: Schema.Types.Mixed,
    sponsorName: Schema.Types.Mixed,
    sponsorIdNumber: Schema.Types.Mixed,

    avatarUrl: Schema.Types.Mixed,
    avatarPublicId: Schema.Types.Mixed,

    passport: Schema.Types.Mixed,

    healthInsurance: Schema.Types.Mixed,

    hajjDetails: Schema.Types.Mixed,

    qrData: Schema.Types.Mixed,

    iqamaImage: Schema.Types.Mixed,
    iqamaPublicId: Schema.Types.Mixed,
  },
  {
    timestamps: true,
    strict: false,
    collection: "users",
  }
);

export const Employee =
  mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", employeeSchema);