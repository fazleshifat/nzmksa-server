import mongoose, { Document, Schema } from "mongoose";

export interface IPasskey {
  credentialId: string;
  publicKey: Buffer;
  counter: number;
  transports?: string[];
  deviceType?: string;
  backedUp?: boolean;
}

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

  passkeys?: IPasskey[];

  createdAt: Date;
  updatedAt: Date;
}

const passkeySchema = new Schema<IPasskey>(
  {
    credentialId: {
      type: String,
      required: true,
    },

    publicKey: {
      type: Buffer,
      required: true,
    },

    counter: {
      type: Number,
      required: true,
      default: 0,
    },

    transports: {
      type: [String],
      default: undefined,
    },

    deviceType: {
      type: String,
    },

    backedUp: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

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

    passkeys: {
      type: [passkeySchema],
      default: [],
    },
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