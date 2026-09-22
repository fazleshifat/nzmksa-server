import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db";
import { Employee } from "./models/Employee";

const users = [
  {
    name: "JAHAMMED SHEK",
    residentIdNumber: "2432859995",
    idVersion: "3",
    nationality: "Bangladeshi",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "15/06/1995",
    maritalStatus: "SINGLE",
    sponsorshipTransfers: 1,
    religion: "Islam",
    occupation: "General Worker",
    employer: "Demo Company",
    employerIdNumber: "7011223344",
    issuePlace: "N/A",
    workPermit: "Active",
    residentIdIssueDate: "20/08/2022",
    residentIdExpiry: "19/08/2027",
    sponsorName: "N/A",
    sponsorIdNumber: "7011223344",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "EK0987654",
      type: "Normal",
      issuingDate: "02/03/2021",
      expiryDate: "01/03/2031",
      issuingCity: "113",
      status: "-"
    },
    hajjDetails: { status: "eligible", lastHajjYear: "-" },
    qrData: {
      name: "JAHAMMED SHEK",
      residentIdNumber: "2432859995",
      nationality: "Bangladeshi",
      dateOfBirth: "15/06/1995",
      sponsorName: "N/A",
      sponsorIdNumber: "7011223344"
    }
  },
  {
    name: "MD BASIR SIKDER",
    residentIdNumber: "2600483065",
    idVersion: "N/A",
    nationality: "Bangladeshi",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "01/01/1985",
    maritalStatus: "SINGLE",
    sponsorshipTransfers: 0,
    religion: "Islam",
    occupation: "-",
    employer: "-",
    employerIdNumber: "-",
    issuePlace: "-",
    workPermit: "-",
    residentIdIssueDate: "24/03/2027",
    residentIdExpiry: "04/06/2027",
    sponsorName: "نقليات عايد جزاء الحربي",
    sponsorIdNumber: "7025924718",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A11359211",
      type: "Normal",
      issuingDate: "23/07/2023",
      expiryDate: "22/07/2033",
      issuingCity: "Bangladesh",
      status: "-"
    },
    healthInsurance: { issuingDate: "18/12/2025", expiryDate: "22/11/2026" },
    hajjDetails: { status: "eligible", lastHajjYear: "-" },
    qrData: {
      name: "MD BASIR SIKDER",
      residentIdNumber: "2600483065",
      nationality: "Bangladeshi",
      dateOfBirth: "01/01/1985",
      sponsorName: "نقليات عايد جزاء الحربي",
      sponsorIdNumber: "7025924718"
    }
  },
  {
    name: "RAJAUL ISLAM",
    residentIdNumber: "2601270883",
    idVersion: "N/A",
    nationality: "Bangladeshi",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "05/03/1989",
    maritalStatus: "SINGLE",
    sponsorshipTransfers: 0,
    religion: "Islam",
    occupation: "-",
    employer: "-",
    employerIdNumber: "-",
    issuePlace: "-",
    workPermit: "-",
    residentIdIssueDate: "08/04/2025",
    residentIdExpiry: "04/06/2027",
    sponsorName: "مؤسسة مويضي عزيز جعيثن الحربي للمقاولات العامة",
    sponsorIdNumber: "7043778931",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A08446736",
      type: "Normal",
      issuingDate: "11/12/2023",
      expiryDate: "10/12/2033",
      issuingCity: "Bangladesh",
      status: "-"
    },
    healthInsurance: { issuingDate: "21/07/2026", expiryDate: "20/07/2027" },
    hajjDetails: { status: "eligible", lastHajjYear: "-" },
    qrData: {
      name: "RAJAUL ISLAM",
      residentIdNumber: "2601270883",
      nationality: "Bangladeshi",
      dateOfBirth: "05/03/1989",
      sponsorName: "مؤسسة مويضي عزيز جعيثن الحربي للمقاولات العامة",
      sponsorIdNumber: "7043778931"
    }
  },
  {
    name: "MD TAREQ AZIZ",
    residentIdNumber: "2536788355",
    idVersion: "N/A",
    nationality: "Bangladeshi",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "17/10/1984",
    maritalStatus: "SINGLE",
    sponsorshipTransfers: 0,
    religion: "Islam",
    occupation: "-",
    employer: "-",
    employerIdNumber: "-",
    issuePlace: "-",
    workPermit: "-",
    residentIdIssueDate: "08/01/2023",
    residentIdExpiry: "12/02/2027",
    sponsorName: "تقلبات سعد الناصر",
    sponsorIdNumber: "7028948458",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A04021766",
      type: "Normal",
      issuingDate: "24/07/2022",
      expiryDate: "23/07/2032",
      issuingCity: "Bangladesh",
      status: "-"
    },
    healthInsurance: { issuingDate: "30/01/2026", expiryDate: "30/01/2027" },
    hajjDetails: { status: "eligible", lastHajjYear: "-" },
    qrData: {
      name: "MD TAREQ AZIZ",
      residentIdNumber: "2536788355",
      nationality: "Bangladeshi",
      dateOfBirth: "17/10/1984",
      sponsorName: "تقلبات سعد الناصر",
      sponsorIdNumber: "7028948458"
    }
  },
  {
    name: "MD SHEIKH FARID",
    residentIdNumber: "2578742500",
    idVersion: "N/A",
    nationality: "Bangladeshi",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "28/11/2002",
    maritalStatus: "SINGLE",
    sponsorshipTransfers: 0,
    religion: "Islam",
    occupation: "ব্যবসা",
    employer: "-",
    employerIdNumber: "-",
    issuePlace: "-",
    workPermit: "-",
    residentIdIssueDate: "15/07/2024",
    residentIdExpiry: "21/02/2027",
    sponsorName: "غيداء الحربي للنقليات",
    sponsorIdNumber: "7031826089",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A07429518",
      type: "Normal",
      issuingDate: "26/03/2023",
      expiryDate: "25/03/2033",
      issuingCity: "Bangladesh",
      status: "-"
    },
    healthInsurance: { issuingDate: "07/02/2026", expiryDate: "06/02/2027" },
    hajjDetails: { status: "eligible", lastHajjYear: "-" },
    qrData: {
      name: "MD SHEIKH FARID",
      residentIdNumber: "2578742500",
      nationality: "Bangladeshi",
      dateOfBirth: "28/11/2002",
      sponsorName: "غيداء الحربي للنقليات",
      sponsorIdNumber: "7031826089"
    }
  },
  {
    name: "ABDUR RAHIM",
    residentIdNumber: "2563329362",
    idVersion: "N/A",
    nationality: "Bangladeshi",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "07/07/1986",
    maritalStatus: "SINGLE",
    sponsorshipTransfers: 0,
    religion: "Islam",
    occupation: "-",
    employer: "-",
    employerIdNumber: "-",
    issuePlace: "-",
    workPermit: "-",
    residentIdIssueDate: "31/12/2023",
    residentIdExpiry: "12/01/2027",
    sponsorName: "مؤسسة عامر على مناور المطيري للمقاولات العامة",
    sponsorIdNumber: "7043009708",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A11302679",
      type: "Normal",
      issuingDate: "19/07/2023",
      expiryDate: "18/07/2033",
      issuingCity: "Bangladesh",
      status: "-"
    },
    healthInsurance: { issuingDate: "26/01/2026", expiryDate: "25/01/2027" },
    hajjDetails: { status: "eligible", lastHajjYear: "-" },
    qrData: {
      name: "ABDUR RAHIM",
      residentIdNumber: "2563329362",
      nationality: "Bangladeshi",
      dateOfBirth: "07/07/1986",
      sponsorName: "مؤسسة عامر على مناور المطيري للمقاولات العامة",
      sponsorIdNumber: "7043009708"
    }
  },
  {
    name: "MD SAIFUL ISLAM",
    residentIdNumber: "2530696026",
    idVersion: "N/A",
    nationality: "Bangladeshi",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "09/10/1993",
    maritalStatus: "SINGLE",
    sponsorshipTransfers: 0,
    religion: "Islam",
    occupation: "-",
    employer: "-",
    employerIdNumber: "-",
    issuePlace: "-",
    workPermit: "-",
    residentIdIssueDate: "31/12/2022",
    residentIdExpiry: "01/02/2027",
    sponsorName: "شركة مبارك على آل منصور للنقل والتخزين",
    sponsorIdNumber: "7039028548",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A03073796",
      type: "Normal",
      issuingDate: "25/01/2022",
      expiryDate: "24/01/2032",
      issuingCity: "Bangladesh",
      status: "-"
    },
    healthInsurance: { issuingDate: "23/05/2026", expiryDate: "22/05/2027" },
    hajjDetails: { status: "eligible", lastHajjYear: "-" },
    qrData: {
      name: "MD SAIFUL ISLAM",
      residentIdNumber: "2530696026",
      nationality: "Bangladeshi",
      dateOfBirth: "09/10/1993",
      sponsorName: "شركة مبارك على آل منصور للنقل والتخزين",
      sponsorIdNumber: "7039028548"
    }
  },
  {
    name: "MD ELANUR MATOBBER",
    residentIdNumber: "2600976894",
    idVersion: "N/A",
    nationality: "Bangladeshi",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "01/01/1988",
    maritalStatus: "SINGLE",
    sponsorshipTransfers: 0,
    religion: "Islam",
    occupation: "-",
    employer: "-",
    employerIdNumber: "-",
    issuePlace: "-",
    workPermit: "-",
    residentIdIssueDate: "05/04/2025",
    residentIdExpiry: "04/06/2027",
    sponsorName: "العمل مؤسسة سعود بن سفاح بن صالح الفيداني للمقاولات العامة.",
    sponsorIdNumber: "7043138887",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A17150918",
      type: "Normal",
      issuingDate: "04/12/2024",
      expiryDate: "03/12/2034",
      issuingCity: "Bangladesh",
      status: "-"
    },
    healthInsurance: { issuingDate: "01/07/2026", expiryDate: "30/06/2027" },
    hajjDetails: { status: "eligible", lastHajjYear: "-" },
    qrData: {
      name: "MD ELANUR MATOBBER",
      residentIdNumber: "2600976894",
      nationality: "Bangladeshi",
      dateOfBirth: "01/01/1988",
      sponsorName: "العمل مؤسسة سعود بن سفاح بن صالح الفيداني للمقاولات العامة.",
      sponsorIdNumber: "7043138887"
    }
  },
  {
    name: "CHUNNU SHEIKH",
    residentIdNumber: "2600976498",
    idVersion: "N/A",
    nationality: "Bangladeshi",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "10/10/1989",
    maritalStatus: "SINGLE",
    sponsorshipTransfers: 0,
    religion: "Islam",
    occupation: "-",
    employer: "-",
    employerIdNumber: "-",
    issuePlace: "-",
    workPermit: "-",
    residentIdIssueDate: "05/04/2025",
    residentIdExpiry: "01/03/2027",
    sponsorName: "مؤسسة سعود بن صلاح بن صالح الفيداني للمقاولات العامة",
    sponsorIdNumber: "7043009708",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A03870440",
      type: "Normal",
      issuingDate: "10/05/2022",
      expiryDate: "09/05/2027",
      issuingCity: "Bangladesh",
      status: "-"
    },
    healthInsurance: { issuingDate: "01/07/2026", expiryDate: "30/06/2027" },
    hajjDetails: { status: "eligible", lastHajjYear: "-" },
    qrData: {
      name: "CHUNNU SHEIKH",
      residentIdNumber: "2600976498",
      nationality: "Bangladeshi",
      dateOfBirth: "10/10/1989",
      sponsorName: "مؤسسة سعود بن صلاح بن صالح الفيداني للمقاولات العامة",
      sponsorIdNumber: "7043009708"
    }
  }
];

const run = async () => {
  await connectDB();

  const passwordHash = await bcrypt.hash("Aa123456", 12);

  for (const user of users) {
    await Employee.updateOne(
      { residentIdNumber: user.residentIdNumber },
      { $set: { ...user, password: passwordHash } },
      { upsert: true }
    );
  }

  console.log(`Seeded ${users.length} employees`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});