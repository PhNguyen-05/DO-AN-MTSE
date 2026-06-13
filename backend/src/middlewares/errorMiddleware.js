const notFound = (req, res, next) => {
  const error = new Error(`Khong tim thay route: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || "Loi may chu"
  });
};

module.exports = { notFound, errorHandler };
