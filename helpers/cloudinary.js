const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "tinsoft-technologies",
  api_key: "258468962871469",
  api_secret: "4FLZfZwulpmkTqiklxTFcf4DATo",
});

exports.uploads = (file, folder) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      file,
      (result) => {
        resolve({
          url: result.url,
          id: result.public_id,
        });
      },
      {
        resource_type: "auto",
        folder: folder,
      }
    );
  });
};
