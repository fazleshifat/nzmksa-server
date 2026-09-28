import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Employee } from "./models/Employee";

const employees = [
  {
    residentIdNumber: "2600976498",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "10/10/1989",
    employer: "-",
    employerIdNumber: "-",
    hajjDetails: {
      status: "eligible",
      lastHajjYear: "-",
    },
    healthInsurance: {
      issuingDate: "01/07/2026",
      expiryDate: "30/06/2027",
    },
    idVersion: "N/A",
    issuePlace: "-",
    maritalStatus: "SINGLE",
    name: "CHUNNU SHEIKH",
    nationality: "Bangladeshi",
    occupation: "-",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A03870440",
      type: "Normal",
      issuingDate: "10/05/2022",
      expiryDate: "09/05/2027",
      issuingCity: "Bangladesh",
      status: "-",
    },
    password:
      "$2b$12$BqjuSGAUp941qrxZhTTp/.Rk3angBJKqlEme7VjrYvDNspe7cmTK",
    qrData: {
      name: "CHUNNU SHEIKH",
      residentIdNumber: "2600976498",
      nationality: "Bangladeshi",
      dateOfBirth: "10/10/1989",
      sponsorName:
        "مؤسسة سعود بن صلاح بن صالح الفيداني للمقاولات العامة",
      sponsorIdNumber: "7043009708",
    },
    religion: "Islam",
    residentIdExpiry: "01/03/2027",
    residentIdIssueDate: "05/04/2025",
    sponsorIdNumber: "7043009708",
    sponsorName:
      "مؤسسة سعود بن صلاح بن صالح الفيداني للمقاولات العامة",
    sponsorshipTransfers: 0,
    workPermit: "-",
    avatarUrl:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790107701/absher/employees/6ab2bbf6c99c874ee2c269af/avatar/rojhcqyvsv8nfiyrvyul.png",
    iqamaImage:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790107752/absher/employees/6ab2bbf6c99c874ee2c269af/iqama/xlihfrhurabe8hjzrrqs.jpg",
  },

  {
    residentIdNumber: "2600976894",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "01/01/1988",
    employer: "-",
    employerIdNumber: "-",
    hajjDetails: {
      status: "eligible",
      lastHajjYear: "-",
    },
    healthInsurance: {
      issuingDate: "01/07/2026",
      expiryDate: "30/06/2027",
    },
    idVersion: "N/A",
    issuePlace: "-",
    maritalStatus: "SINGLE",
    name: "MD ELANUR MATOBBER",
    nationality: "Bangladeshi",
    occupation: "-",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A17150918",
      type: "Normal",
      issuingDate: "04/12/2024",
      expiryDate: "03/12/2034",
      issuingCity: "Bangladesh",
      status: "-",
    },
    password:
      "$2b$12$BqjuSGAUp941qrxZhTTp/.Rk3angBJKqlEme7VjrYxvDNspe7cmTK",
    qrData: {
      name: "MD ELANUR MATOBBER",
      residentIdNumber: "2600976894",
      nationality: "Bangladeshi",
      dateOfBirth: "01/01/1988",
      sponsorName:
        "العمل مؤسسة سعود بن سفاح بن صالح الفيداني للمقاولات العامة.",
      sponsorIdNumber: "7043138887",
    },
    religion: "Islam",
    residentIdExpiry: "04/06/2027",
    residentIdIssueDate: "05/04/2025",
    sponsorIdNumber: "7043138887",
    sponsorName:
      "العمل مؤسسة سعود بن سفاح بن صالح الفيداني للمقاولات العامة.",
    sponsorshipTransfers: 0,
    workPermit: "-",
    avatarUrl:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790107794/absher/employees/6ab2bbf6c99c874ee2c269ae/avatar/dd3xw1ubruxyh9kmmcg4.png",
    iqamaImage:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790107795/absher/employees/6ab2bbf6c99c874ee2c269ae/iqama/u1hrvldqd17vmgssmgs8.jpg",
  },

  {
    residentIdNumber: "2530696026",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "09/10/1993",
    employer: "-",
    employerIdNumber: "-",
    hajjDetails: {
      status: "eligible",
      lastHajjYear: "-",
    },
    healthInsurance: {
      issuingDate: "23/05/2026",
      expiryDate: "22/05/2027",
    },
    idVersion: "N/A",
    issuePlace: "-",
    maritalStatus: "SINGLE",
    name: "MD SAIFUL ISLAM",
    nationality: "Bangladeshi",
    occupation: "-",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A03073796",
      type: "Normal",
      issuingDate: "25/01/2022",
      expiryDate: "24/01/2032",
      issuingCity: "Bangladesh",
      status: "-",
    },
    password:
      "$2b$12$BqjuSGAUp941qrxZhTTp/.Rk3angBJKqlEme7VjrYvDNspe7cmTK",
    qrData: {
      name: "MD SAIFUL ISLAM",
      residentIdNumber: "2530696026",
      nationality: "Bangladeshi",
      dateOfBirth: "09/10/1993",
      sponsorName: "شركة مبارك على آل منصور للنقل والتخزين",
      sponsorIdNumber: "7039028548",
    },
    religion: "Islam",
    residentIdExpiry: "01/02/2027",
    residentIdIssueDate: "31/12/2022",
    sponsorIdNumber: "7039028548",
    sponsorName: "شركة مبارك على آل منصور للنقل والتخزين",
    sponsorshipTransfers: 0,
    workPermit: "-",
    avatarUrl:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790107918/absher/employees/6ab2bbf6c99c874ee2c269ad/avatar/qdq7zismxgqltngfhlu6.png",
    iqamaImage:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790107919/absher/employees/6ab2bbf6c99c874ee2c269ad/iqama/h98cyftzrkj8nsgfvxa8.jpg",
  },

  {
    residentIdNumber: "2563329362",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "07/07/1986",
    employer: "-",
    employerIdNumber: "-",
    hajjDetails: {
      status: "eligible",
      lastHajjYear: "-",
    },
    healthInsurance: {
      issuingDate: "26/01/2026",
      expiryDate: "25/01/2027",
    },
    idVersion: "N/A",
    issuePlace: "-",
    maritalStatus: "SINGLE",
    name: "ABDUR RAHIM",
    nationality: "Bangladeshi",
    occupation: "-",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A11302679",
      type: "Normal",
      issuingDate: "19/07/2023",
      expiryDate: "18/07/2033",
      issuingCity: "Bangladesh",
      status: "-",
    },
    password:
      "$2b$12$BqjuSGAUp941qrxZhTTp/.Rk3angBJKqlEme7VjrYvDNspe7cmTK",
    qrData: {
      name: "ABDUR RAHIM",
      residentIdNumber: "2563329362",
      nationality: "Bangladeshi",
      dateOfBirth: "07/07/1986",
      sponsorName:
        "مؤسسة عامر على مناور المطيري للمقاولات العامة",
      sponsorIdNumber: "7043009708",
    },
    religion: "Islam",
    residentIdExpiry: "12/01/2027",
    residentIdIssueDate: "31/12/2023",
    sponsorIdNumber: "7043009708",
    sponsorName:
      "مؤسسة عامر على مناور المطيري للمقاولات العامة",
    sponsorshipTransfers: 0,
    workPermit: "-",
    avatarUrl:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790114231/absher/employees/6ab2bbf6c99c874ee2c269ac/avatar/haunpptgsc52kq8qjx0g.png",
    iqamaImage:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790114233/absher/employees/6ab2bbf6c99c874ee2c269ac/iqama/dky5yave3wqvarscr5pm.jpg",
  },

  {
    residentIdNumber: "2578742500",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "28/11/2002",
    employer: "-",
    employerIdNumber: "-",
    hajjDetails: {
      status: "eligible",
      lastHajjYear: "-",
    },
    healthInsurance: {
      issuingDate: "07/02/2026",
      expiryDate: "06/02/2027",
    },
    idVersion: "N/A",
    issuePlace: "-",
    maritalStatus: "SINGLE",
    name: "MD SHEIKH FARID",
    nationality: "Bangladeshi",
    occupation: "ব্যবসা",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A07429518",
      type: "Normal",
      issuingDate: "26/03/2023",
      expiryDate: "25/03/2033",
      issuingCity: "Bangladesh",
      status: "-",
    },
    password:
      "$2b$12$BqjuSGAUp941qrxZhTTp/.Rk3angBJKqlEme7VjrYvDNspe7cmTK",
    qrData: {
      name: "MD SHEIKH FARID",
      residentIdNumber: "2578742500",
      nationality: "Bangladeshi",
      dateOfBirth: "28/11/2002",
      sponsorName: "غيداء الحربي للنقليات",
      sponsorIdNumber: "7031826089",
    },
    religion: "Islam",
    residentIdExpiry: "21/02/2027",
    residentIdIssueDate: "15/07/2024",
    sponsorIdNumber: "7031826089",
    sponsorName: "غيداء الحربي للنقليات",
    sponsorshipTransfers: 0,
    workPermit: "-",
    avatarUrl:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790114252/absher/employees/6ab2bbf6c99c874ee2c269ab/avatar/yu5dm8zs6pu8fpzdo1lj.png",
    iqamaImage:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790114254/absher/employees/6ab2bbf6c99c874ee2c269ab/iqama/g2j7vvbjxikah320hzhz.jpg",
  },

  {
    residentIdNumber: "2536788355",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "17/10/1984",
    employer: "-",
    employerIdNumber: "-",
    hajjDetails: {
      status: "eligible",
      lastHajjYear: "-",
    },
    healthInsurance: {
      issuingDate: "30/01/2026",
      expiryDate: "30/01/2027",
    },
    idVersion: "N/A",
    issuePlace: "-",
    maritalStatus: "SINGLE",
    name: "MD TAREQ AZIZ",
    nationality: "Bangladeshi",
    occupation: "-",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A04021766",
      type: "Normal",
      issuingDate: "24/07/2022",
      expiryDate: "23/07/2032",
      issuingCity: "Bangladesh",
      status: "-",
    },
    password:
      "$2b$12$BqjuSGAUp941qrxZhTTp/.Rk3angBJKqlEme7VjrYvDNspe7cmTK",
    qrData: {
      name: "MD TAREQ AZIZ",
      residentIdNumber: "2536788355",
      nationality: "Bangladeshi",
      dateOfBirth: "17/10/1984",
      sponsorName: "تقلبات سعد الناصر",
      sponsorIdNumber: "7028948458",
    },
    religion: "Islam",
    residentIdExpiry: "12/02/2027",
    residentIdIssueDate: "08/01/2023",
    sponsorIdNumber: "7028948458",
    sponsorName: "تقلبات سعد الناصر",
    sponsorshipTransfers: 0,
    workPermit: "-",
    avatarUrl:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790114281/absher/employees/6ab2bbf6c99c874ee2c269aa/avatar/l7nt5cyqvfzxxml8oxgh.png",
    iqamaImage:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790114283/absher/employees/6ab2bbf6c99c874ee2c269aa/iqama/ko8jvzfusn9c6if9zg29.jpg",
  },

  {
    residentIdNumber: "2601270883",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "05/03/1989",
    employer: "-",
    employerIdNumber: "-",
    hajjDetails: {
      status: "eligible",
      lastHajjYear: "-",
    },
    healthInsurance: {
      issuingDate: "21/07/2026",
      expiryDate: "20/07/2027",
    },
    idVersion: "N/A",
    issuePlace: "-",
    maritalStatus: "SINGLE",
    name: "RAJAUL ISLAM",
    nationality: "Bangladeshi",
    occupation: "-",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A08446736",
      type: "Normal",
      issuingDate: "11/12/2023",
      expiryDate: "10/12/2033",
      issuingCity: "Bangladesh",
      status: "-",
    },
    password:
      "$2b$12$BqjuSGAUp941qrxZhTTp/.Rk3angBJKqlEme7VjrYvDNspe7cmTK",
    qrData: {
      name: "RAJAUL ISLAM",
      residentIdNumber: "2601270883",
      nationality: "Bangladeshi",
      dateOfBirth: "05/03/1989",
      sponsorName:
        "مؤسسة مويضي عزيز جعيثن الحربي للمقاولات العامة",
      sponsorIdNumber: "7043778931",
    },
    religion: "Islam",
    residentIdExpiry: "04/06/2027",
    residentIdIssueDate: "08/04/2025",
    sponsorIdNumber: "7043778931",
    sponsorName:
      "مؤسسة مويضي عزيز جعيثن الحربي للمقاولات العامة",
    sponsorshipTransfers: 0,
    workPermit: "-",
    avatarUrl:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790114310/absher/employees/6ab2bbf6c99c874ee2c269a9/avatar/fgqz08iejfksxyatcw1x.png",
    iqamaImage:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790114312/absher/employees/6ab2bbf6c99c874ee2c269a9/iqama/sbrg6s8f6fj9zmvso9gr.jpg",
  },

  {
    residentIdNumber: "2600483065",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "01/01/1985",
    employer: "-",
    employerIdNumber: "-",
    hajjDetails: {
      status: "eligible",
      lastHajjYear: "-",
    },
    healthInsurance: {
      issuingDate: "18/12/2025",
      expiryDate: "22/11/2026",
    },
    idVersion: "N/A",
    issuePlace: "-",
    maritalStatus: "SINGLE",
    name: "MD BASIR SIKDER",
    nationality: "Bangladeshi",
    occupation: "-",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "A11359211",
      type: "Normal",
      issuingDate: "23/07/2023",
      expiryDate: "22/07/2033",
      issuingCity: "Bangladesh",
      status: "-",
    },
    password:
      "$2b$12$BqjuSGAUp941qrxZhTTp/.Rk3angBJKqlEme7VjrYvDNspe7cmTK",
    qrData: {
      name: "MD BASIR SIKDER",
      residentIdNumber: "2600483065",
      nationality: "Bangladeshi",
      dateOfBirth: "01/01/1985",
      sponsorName: "نقليات عايد جزاء الحربي",
      sponsorIdNumber: "7025924718",
    },
    religion: "Islam",
    residentIdExpiry: "04/06/2027",
    residentIdIssueDate: "24/03/2027",
    sponsorIdNumber: "7025924718",
    sponsorName: "نقليات عايد جزاء الحربي",
    sponsorshipTransfers: 0,
    workPermit: "-",
    avatarUrl:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790114327/absher/employees/6ab2bbf6c99c874ee2c269a8/avatar/xvqpdyj3wxugl0j5iae8.png",
    iqamaImage:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790114700/absher/employees/6ab2bbf6c99c874ee2c269a8/iqama/qji6prl6s1qjgwxpohq5.jpg",
  },

  {
    residentIdNumber: "2432859995",
    birthCity: "-",
    birthCountry: "Bangladesh",
    dateOfBirth: "15/06/1995",
    employer: "N/A",
    employerIdNumber: "7011223344",
    hajjDetails: {
      status: "eligible",
      lastHajjYear: "-",
    },
    idVersion: "3",
    issuePlace: "N/A",
    maritalStatus: "SINGLE",
    name: "JAHAMMED SHEK",
    nationality: "Bangladeshi",
    occupation: "General Worker",
    passport: {
      amountDeposit: "SAR 0.00",
      passportNumber: "EK0987654",
      type: "Normal",
      issuingDate: "02/03/2021",
      expiryDate: "01/03/2031",
      issuingCity: "113",
      status: "-",
    },
    password:
      "$2b$12$BqjuSGAUp941qrxZhTTp/.Rk3angBJKqlEme7VjrYvDNspe7cmTK",
    qrData: {
      name: "JAHAMMED SHEK",
      residentIdNumber: "2432859995",
      nationality: "Bangladeshi",
      dateOfBirth: "15/06/1995",
      sponsorName: "N/A",
      sponsorIdNumber: "7011223344",
    },
    religion: "Islam",
    residentIdExpiry: "19/08/2027",
    residentIdIssueDate: "20/08/2022",
    sponsorIdNumber: "7011223344",
    sponsorName: "N/A",
    sponsorshipTransfers: 1,
    workPermit: "Active",
    avatarUrl:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790107886/absher/employees/6ab2bbf6c99c874ee2c269a7/avatar/ficzddfdupainbtnow6g.png",
    iqamaImage:
      "https://res.cloudinary.com/s3cnx6gj/image/upload/v1790107888/absher/employees/6ab2bbf6c99c874ee2c269a7/iqama/jzrbb3k9bfl1lgzk4rqj.png",
  },
];

const seedEmployees = async () => {
  try {
    await connectDB();

    await Employee.deleteMany({});

    const result = await Employee.insertMany(employees);

    console.log(`✅ Seeded ${result.length} employees successfully.`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Employee seeding failed:", error);

    await mongoose.connection.close();
    process.exit(1);
  }
};

seedEmployees();