const globalErrHandler = (err, req, res, next) => {
  const stack = err.stack;
  const message = err.message;
  const status = err.status ? err.status : "failed";
  const statusCode = err?.statusCode ? err.statusCode : 500;
  //send the response
  res.status(statusCode).json({
    message,
    stack,
    status,
  });
};

module.exports = globalErrHandler;
