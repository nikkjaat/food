const allowedOrigins = [
  "https://food-hub-frontend.vercel.app",
  "https://aesthetic-toffee-df3bb9.netlify.app",
  "http://localhost:3000",
  "https://food-hubb.netlify.app/",
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
