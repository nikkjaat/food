const allowedOrigins = [
  "http://localhost:3000",
  ["https://food-hub-phi.vercel.app/"],
  ["https://food-m29jtq56z-nikhils-projects-2570a626.vercel.app/"],
  ["*"],
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
