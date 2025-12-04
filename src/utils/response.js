const successResponse = (res, statusCode, message, body) => {
  const response = {
    success: true,
    message,
  };
  if (body !== undefined) {
    response.body = body;
  }
  res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode, message) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { successResponse, errorResponse };
