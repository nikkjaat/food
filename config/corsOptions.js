const allowedOrigins = [
  "https://nikhil-food-lmgsp6lut-nikhils-projects-2570a626.vercel.app",
  "https://aesthetic-toffee-df3bb9.netlify.app",
  ,
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
