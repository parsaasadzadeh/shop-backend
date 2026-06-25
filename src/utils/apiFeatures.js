class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search() {
    if (this.queryString.search) {
      this.query = this.query.find({
        title: { $regex: this.queryString.search, $options: "i" },
      });
    }
    return this;
  }

  filter() {
    const filterQuery = {};

    if (this.queryString.category) {
      filterQuery.category = this.queryString.category;
    }

    if (this.queryString.gender) {
      filterQuery.gender = this.queryString.gender;
    }

    if (this.queryString.minPrice || this.queryString.maxPrice) {
      filterQuery.finalPrice = {};
      if (this.queryString.minPrice) {
        filterQuery.finalPrice.$gte = Number(this.queryString.minPrice);
      }
      if (this.queryString.maxPrice) {
        filterQuery.finalPrice.$lte = Number(this.queryString.maxPrice);
      }
    }

    this.query = this.query.find(filterQuery);
    return this;
  }

  sort() {
    let sortBy = "-createdAt";

    if (this.queryString.sort === "price_asc") sortBy = "finalPrice";
    if (this.queryString.sort === "price_desc") sortBy = "-finalPrice";
    if (this.queryString.sort === "newest") sortBy = "-createdAt";

    this.query = this.query.sort(sortBy);
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 12;
    const skip = (page - 1) * limit;

    this.page = page;
    this.limit = limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = ApiFeatures;
