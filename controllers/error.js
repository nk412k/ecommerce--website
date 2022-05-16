exports.getError = (req, res, next) => {
  // res.status(404).sendFile(path.join(__dirname,'views','page not found.html'));
  res.status(404).render("page not found", {
    title: "Page Not Found",
    path: "404",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.get500=(req,res,next)=>{
  res.status(500).render("500", {
    title: "Error",
    path: "500",
    isAuthenticated: req.session.isLoggedIn,
  });
}