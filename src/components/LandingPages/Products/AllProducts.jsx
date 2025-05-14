"use client";

import { useGetAllBrandsQuery } from "@/redux/services/brand/brandApi";
import { useGetAllCategoriesQuery } from "@/redux/services/category/categoryApi";
import { useGetAllProductsQuery } from "@/redux/services/product/productApi";
import {
  Pagination,
  Slider,
  Checkbox,
  Select,
  Button,
  Radio,
  Spin,
  Drawer,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useGetAllGlobalSettingQuery } from "@/redux/services/globalSetting/globalSettingApi";
import ProductCard from "../Home/Products/ProductCard";
import { debounce } from "lodash";
import { GiCancel } from "react-icons/gi";
import { useGetAllGenericsQuery } from "@/redux/services/generic/genericApi";

const { Option } = Select;

const AllProducts = ({ searchParams }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedGenerics, setSelectedGenerics] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sorting, setSorting] = useState("");
  const [filterModal, setFilterModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [availability, setAvailability] = useState("inStock");
  const [loading, setLoading] = useState(false);
  const [delayedLoading, setDelayedLoading] = useState(true);

  const [filteredProducts, setFilteredProducts] = useState([]);

  const { data: globalData } = useGetAllGlobalSettingQuery();
  const { data: brandData } = useGetAllBrandsQuery();
  const { data: categoryData } = useGetAllCategoriesQuery();
  const { data: genericData } = useGetAllGenericsQuery();
  const { data: productData } = useGetAllProductsQuery();

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, pageSize]);

  const activeBrands = useMemo(
    () => brandData?.results?.filter((item) => item?.status !== "Inactive"),
    [brandData]
  );

  const activeCategories = useMemo(
    () => categoryData?.results?.filter((item) => item?.status !== "Inactive"),
    [categoryData]
  );

  const activeProducts = useMemo(
    () =>
      productData?.results?.filter((item) => item?.status !== "Inactive") || [],
    [productData]
  );

  const activeGenerics = useMemo(
    () =>
      genericData?.results?.filter((item) => item?.status !== "Inactive") || [],
    [genericData]
  );

  const debouncedSetSearchFilter = useMemo(
    () => debounce((value) => setSearchFilter(value?.toLowerCase()), 300),
    []
  );

  useEffect(() => {
    if (searchParams) {
      debouncedSetSearchFilter(searchParams);
    } else {
      setSearchFilter("");
      setSelectedBrands([]);
      setSelectedCategories([]);
      setSelectedGenerics([]);
      setPriceRange([0, 10000]);
      setSorting("");
    }
    return () => debouncedSetSearchFilter.cancel();
  }, [searchParams, debouncedSetSearchFilter]);

  useEffect(() => {
    if (searchFilter) {
      const matchedBrands = activeBrands
        ?.filter((brand) => brand?.name?.toLowerCase().includes(searchFilter))
        .map((brand) => brand.name);
      const matchedCategories = activeCategories
        ?.filter((category) =>
          category?.name?.toLowerCase().includes(searchFilter)
        )
        .map((category) => category.name);
      const matchedGenerics = activeGenerics
        ?.filter((generic) =>
          generic?.name?.toLowerCase().includes(searchFilter)
        )
        .map((generic) => generic.name);

      setSelectedBrands(matchedBrands || []);
      setSelectedCategories(matchedCategories || []);
      setSelectedGenerics(matchedGenerics || []);
    }
  }, [searchFilter, activeBrands, activeCategories, activeGenerics]);

  useEffect(() => {
    const applyFilters = () => {
      setLoading(true);

      let filtered = activeProducts?.filter((product) => {
        if (!product) return false;

        const isBrandMatch = selectedBrands.length
          ? selectedBrands.includes(product?.brand?.name)
          : true;

        const isCategoryMatch = selectedCategories.length
          ? selectedCategories.includes(product?.category?.name)
          : true;

        const isGenericMatch = selectedGenerics.length
          ? selectedGenerics.includes(product?.generic?.name)
          : true;

        const isPriceMatch =
          product.sellingPrice >= priceRange[0] &&
          product.sellingPrice <= priceRange[1];

        const isAvailabilityMatch =
          availability === "inStock"
            ? product.stock > 0
            : availability === "outOfStock"
            ? product.stock === 0
            : true;

        const isSearchMatch =
          searchFilter?.length > 0
            ? product?.name?.toLowerCase().includes(searchFilter) ||
              product?.brand?.name?.toLowerCase().includes(searchFilter) ||
              product?.category?.name?.toLowerCase().includes(searchFilter) ||
              product?.generic?.name?.toLowerCase().includes(searchFilter)
            : true;

        return (
          isBrandMatch &&
          isCategoryMatch &&
          isGenericMatch &&
          isPriceMatch &&
          isAvailabilityMatch &&
          isSearchMatch
        );
      });

      let sorted = [...filtered];
      if (sorting === "PriceLowToHigh") {
        sorted = sorted.sort((a, b) => {
          const offerPriceA = a.offerPrice || a.sellingPrice;
          const offerPriceB = b.offerPrice || b.sellingPrice;
          return offerPriceA - offerPriceB;
        });
      } else if (sorting === "PriceHighToLow") {
        sorted = sorted.sort((a, b) => {
          const offerPriceA = a.offerPrice || a.sellingPrice;
          const offerPriceB = b.offerPrice || b.sellingPrice;
          return offerPriceB - offerPriceA;
        });
      }

      setTimeout(() => {
        setFilteredProducts(sorted);
        setLoading(false);
      }, 200);
    };

    applyFilters();
  }, [
    activeProducts,
    selectedBrands,
    selectedCategories,
    selectedGenerics,
    priceRange,
    sorting,
    availability,
    searchFilter,
  ]);

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleBrandChange = (checkedValues) => {
    setSelectedBrands(checkedValues);
  };

  const handleCategoryChange = (checkedValues) => {
    setSelectedCategories(checkedValues);
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
  };

  const handleSortingChange = (value) => {
    setSorting(value);
  };

  const handleAvailabilityChange = (e) => {
    setAvailability(e.target.value);
  };

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setDelayedLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <section className="pb-10 relative">
      <div className="bg-primary py-10 lg:py-20 mb-5 lg:mb-10 text-medium text-xl md:text-3xl text-center text-white">
        {selectedBrands.length > 0 ||
        selectedCategories.length > 0 ||
        selectedGenerics.length > 0 ? (
          <>
            {selectedBrands.length > 0 && `(${selectedBrands.join(", ")}) `}
            {selectedCategories.length > 0 &&
              `(${selectedCategories.join(", ")}) `}
            {selectedGenerics.length > 0 && `(${selectedGenerics.join(", ")})`}
          </>
        ) : (
          "All Products"
        )}
      </div>

      <div className="my-container">
        <div className="bg-white flex items-center gap-2 justify-between py-3 px-2 lg:px-6 mb-6 rounded-xl">
          <p className="text-xs md:text-base">
            <span className="font-semibold text-lg">
              {loading || delayedLoading ? "..." : filteredProducts?.length}
            </span>{" "}
            products showing.
          </p>
          <div className="flex items-center lg:w-1/4">
            <Select
              allowClear
              placeholder="Select Sorting"
              style={{ width: "100%" }}
              onChange={handleSortingChange}
            >
              <Option value="PriceLowToHigh">Price Low To High</Option>
              <Option value="PriceHighToLow">Price High To Low</Option>
            </Select>
          </div>
          <Button
            type="primary"
            className="lg:hidden"
            onClick={() => setFilterModal(true)}
          >
            Advance Filter
          </Button>
        </div>
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <div className="w-full lg:w-3/12 p-4 border rounded-lg shadow-sm lg:sticky top-5 hidden lg:block bg-grey">
            <h2 className="mb-4 text-lg font-semibold">Filter Products</h2>
            <div className="mb-6 border p-5 rounded-xl max-h-[500px] overflow-y-auto">
              <label className="block mb-2 font-semibold">Brands</label>
              <Checkbox.Group
                options={activeBrands?.map((brand) => {
                  const productCount = productData?.results?.filter(
                    (product) => product?.brand?.name === brand.name
                  ).length;

                  return {
                    label: `${brand.name} (${productCount || 0})`,
                    value: brand.name,
                  };
                })}
                value={selectedBrands}
                onChange={handleBrandChange}
                className="flex flex-col gap-2"
              />
            </div>
            <div className="mb-6 border p-5 rounded-xl max-h-[500px] overflow-y-auto">
              <label className="block mb-2 font-semibold">Categories</label>
              <Checkbox.Group
                options={activeCategories?.map((category) => {
                  const productCount = productData?.results?.filter(
                    (product) => product.category.name === category.name
                  ).length;

                  return {
                    label: `${category.name} (${productCount || 0})`,
                    value: category.name,
                  };
                })}
                value={selectedCategories}
                onChange={handleCategoryChange}
                className="flex flex-col gap-2"
              />
            </div>
            {activeGenerics?.length > 0 && (
              <div className="mb-6 border p-5 rounded-xl max-h-[500px] overflow-y-auto">
                <label className="block mb-2 font-semibold">Generics</label>
                <Checkbox.Group
                  options={activeGenerics?.map((generic) => {
                    const productCount = productData?.results?.filter(
                      (product) => product?.generic?.name === generic?.name
                    ).length;

                    return {
                      label: `${generic.name} (${productCount || 0})`,
                      value: generic.name,
                    };
                  })}
                  value={activeGenerics}
                  onChange={handleCategoryChange}
                  className="flex flex-col gap-2"
                />
              </div>
            )}
            <div className="mb-6">
              <label className="block mb-2 font-semibold">Price Range</label>
              <Slider
                range
                min={0}
                max={10000}
                defaultValue={[0, 10000]}
                value={priceRange}
                onChange={handlePriceChange}
                step={50}
                tooltip={{
                  formatter: (value) =>
                    `${globalData?.results?.currency} ${value}`,
                }}
              />
              <div className="flex justify-between mt-2 text-sm">
                <span>
                  {globalData?.results?.currency + " " + priceRange[0]}
                </span>
                <span>
                  {globalData?.results?.currency + " " + priceRange[1]}
                </span>
              </div>
            </div>
            <div className="mb-6 rounded-xl border p-5">
              <label className="block mb-2 font-semibold">Availability</label>
              <Radio.Group
                value={availability}
                onChange={handleAvailabilityChange}
                className="flex flex-col gap-2"
              >
                <Radio value="inStock" name="inStock">
                  In Stock (
                  {filteredProducts?.filter?.((item) => item?.stock > 0).length}
                  )
                </Radio>
                <Radio value="outOfStock" name="outOfStock">
                  Out of Stock (
                  {filteredProducts?.filter?.((item) => item?.stock < 0).length}
                  )
                </Radio>
              </Radio.Group>
            </div>
          </div>
          <div className="w-full">
            <div>
              {loading || delayedLoading ? (
                <div className="flex justify-center py-10">
                  <Spin size="large" />
                </div>
              ) : paginatedProducts?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-5">
                  {paginatedProducts?.map((product) => (
                    <ProductCard key={product?._id} item={product} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 mt-32 text-xl">
                  No products found.
                </p>
              )}
              <div className="flex justify-end pt-10">
                <Pagination
                  current={currentPage}
                  total={filteredProducts.length}
                  pageSize={pageSize}
                  showSizeChanger
                  pageSizeOptions={["10", "20", "50", "100"]}
                  onChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Drawer
        open={filterModal}
        onClose={() => setFilterModal(false)}
        placement="right"
        width={300}
      >
        <div className="flex justify-between items-center border-b pb-2 -mt-2 mb-2">
          <p className="lg:text-2xl font-semibold">Filter Products</p>
          <button
            className="mt-1 bg-gray-200 hover:scale-110 duration-500 rounded-full p-1"
            onClick={() => setFilterModal(false)}
          >
            <GiCancel className="text-xl text-gray-700" />
          </button>
        </div>
        <div className="w-full p-2">
          <div className="mb-6 border p-5 rounded-xl max-h-[500px] overflow-y-auto">
            <label className="block mb-2 font-semibold">Brands</label>
            <Checkbox.Group
              options={activeBrands?.map((brand) => {
                const productCount = productData?.results?.filter(
                  (product) => product?.brand?.name === brand.name
                ).length;

                return {
                  label: `${brand.name} (${productCount || 0})`,
                  value: brand.name,
                };
              })}
              value={selectedBrands}
              onChange={handleBrandChange}
              className="flex flex-col gap-2"
            />
          </div>
          <div className="mb-6 border p-5 rounded-xl max-h-[500px] overflow-y-auto">
            <label className="block mb-2 font-semibold">Categories</label>
            <Checkbox.Group
              options={activeCategories?.map((category) => {
                const productCount = productData?.results?.filter(
                  (product) => product.category.name === category.name
                ).length;

                return {
                  label: `${category.name} (${productCount || 0})`,
                  value: category.name,
                };
              })}
              value={activeGenerics}
              onChange={handleCategoryChange}
              className="flex flex-col gap-2"
            />
          </div>
          {activeGenerics?.length > 0 && (
            <div className="mb-6 border p-5 rounded-xl max-h-[500px] overflow-y-auto">
              <label className="block mb-2 font-semibold">Generics</label>
              <Checkbox.Group
                options={activeGenerics?.map((generic) => {
                  const productCount = productData?.results?.filter(
                    (product) => product?.generic?.name === generic?.name
                  ).length;

                  return {
                    label: `${generic.name} (${productCount || 0})`,
                    value: generic.name,
                  };
                })}
                value={activeGenerics}
                onChange={handleCategoryChange}
                className="flex flex-col gap-2"
              />
            </div>
          )}
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Price Range</label>
            <Slider
              range
              min={0}
              max={10000}
              defaultValue={[0, 10000]}
              value={priceRange}
              onChange={handlePriceChange}
              step={50}
              tooltip={{
                formatter: (value) =>
                  `${globalData?.results?.currency} ${value}`,
              }}
            />
            <div className="flex justify-between mt-2 text-sm">
              <span>{globalData?.results?.currency + " " + priceRange[0]}</span>
              <span>{globalData?.results?.currency + " " + priceRange[1]}</span>
            </div>
          </div>
          <div className="mb-6 rounded-xl border p-5">
            <label className="block mb-2 font-semibold">Availability</label>
            <Radio.Group
              value={availability}
              onChange={handleAvailabilityChange}
              className="flex flex-col gap-2"
              name="stock"
            >
              <Radio value="inStock" name="inStock">
                In Stock (
                {filteredProducts?.filter?.((item) => item?.stock > 0).length})
              </Radio>
              <Radio value="outOfStock" name="outOfStock">
                Out of Stock (
                {filteredProducts?.filter?.((item) => item?.stock < 0).length})
              </Radio>
            </Radio.Group>
          </div>
        </div>
      </Drawer>
    </section>
  );
};

export default AllProducts;
