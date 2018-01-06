exports.addBook = function(req, res, next) {
  console.log("Request received", req.headers["content-type"]);
  let formData = req.body;
  let formPic = req.file;
  console.log('form data', formData);
  console.log('form file', formPic);
  res.sendStatus(200);
}
