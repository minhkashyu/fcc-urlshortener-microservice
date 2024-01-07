require('dotenv').config();

let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

const siteSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: Number,
    default: 0,
  },
});

siteSchema.index({short_url: 1}, {unique: true});

let SiteModel = mongoose.model('Site', siteSchema);

const createAndSaveSite = (obj, done) => {
  let siteDocument = new SiteModel(obj);

  siteDocument.save().then((doc) => {
    done(null, doc);
  }).catch((err) => {
    done(err);
  });
};

const findSiteById = (siteId, done) => {
  SiteModel.find(siteId).then((doc) => {
    done(null, doc);
  }).catch((err) => {
    done(err);
  });
};

const findSiteByOriginalUrl = (originalUrl, done) => {
  SiteModel.findOne({
    original_url: originalUrl,
  }).then((doc) => {
    done(null, doc);
  }).catch((err) => {
    done(err);
  });
};

const findSiteByShortUrl = (shortUrl, done) => {
  SiteModel.findOne({
    short_url: shortUrl,
  }).then((doc) => {
    done(null, doc);
  }).catch((err) => {
    done(err);
  });
};

const findLatestSite = (done) => {
  SiteModel.findOne({}, null, { sort: { short_url: -1} }).then((doc) => {
    done(null, doc);
  }).catch((err) => {
    done(err);
  });
};

exports.SiteModel = SiteModel;
exports.createAndSaveSite = createAndSaveSite;
exports.findSiteById = findSiteById;
exports.findSiteByOriginalUrl = findSiteByOriginalUrl;
exports.findSiteByShortUrl = findSiteByShortUrl;
exports.findLatestSite = findLatestSite;
