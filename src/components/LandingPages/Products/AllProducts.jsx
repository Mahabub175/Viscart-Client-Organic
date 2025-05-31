/* eslint-disable no-undef */
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
import { useDispatch, useSelector } from "react-redux";
import { resetFilter, selectFilter } from "@/redux/services/device/deviceSlice";

const { Option } = Select;

const AllProducts = () => {
  const dispatch = useDispatch();
  const searchParams = useSelector(selectFilter);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sorting, setSorting] = useState("");
  const [filterModal, setFilterModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [availability, setAvailability] = useState("inStock");
  const [loading, setLoading] = useState(false);
  const [delayedLoading, setDelayedLoading] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedGenerics, setSelectedGenerics] = useState([]);

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
      setSearchFilter([searchParams]);
      setPriceRange([0, 10000]);
      setSorting("");
      setSelectedBrands(searchParams);
      setSelectedCategories(searchParams);
      setSelectedGenerics(searchParams);
    } else {
      setSearchFilter([]);
      setPriceRange([0, 10000]);
      setSorting("");
      setSelectedBrands([]);
      setSelectedCategories([]);
      setSelectedGenerics([]);
    }
    return () => debouncedSetSearchFilter.cancel();
  }, [searchParams, debouncedSetSearchFilter]);

  useEffect(() => {
    const applyFilters = () => {
      setLoading(true);

      const filterTerms = [
        ...new Set([
          ...selectedBrands,
          ...selectedCategories,
          ...selectedGenerics,
          ...(searchFilter || []),
        ]),
      ].map((f) => f?.toLowerCase());

      const searchText = (searchParams || "").toLowerCase();

      const matchedBrands =
        activeBrands
          ?.map((b) => b?.name?.toLowerCase())
          .filter((name) => filterTerms.includes(name)) || [];

      const matchedCategories =
        activeCategories
          ?.map((c) => c?.name?.toLowerCase())
          .filter((name) => filterTerms.includes(name)) || [];

      const matchedGenerics =
        activeGenerics
          ?.map((g) => g?.name?.toLowerCase())
          .filter((name) => filterTerms.includes(name)) || [];

      const filtered = activeProducts?.filter((product) => {
        if (!product) return false;

        const isPriceMatch =
          product.sellingPrice >= priceRange[0] &&
          product.sellingPrice <= priceRange[1];

        const isAvailabilityMatch =
          availability === "inStock"
            ? product.stock > 0
            : availability === "outOfStock"
            ? product.stock === 0
            : true;

        const brandName = product?.brand?.name?.toLowerCase();
        const categoryName = product?.category?.name?.toLowerCase();
        const genericName = product?.generic?.name?.toLowerCase();
        const productName = product?.name?.toLowerCase();

        const isBrandMatch =
          matchedBrands?.length === 0 || matchedBrands?.includes(brandName);
        const isCategoryMatch =
          matchedCategories?.length === 0 ||
          matchedCategories?.includes(categoryName);
        const isGenericMatch =
          matchedGenerics?.length === 0 ||
          matchedGenerics?.includes(genericName);

        const matchesSearchParam = searchText
          ? productName?.includes(searchText) ||
            brandName?.includes(searchText) ||
            categoryName?.includes(searchText) ||
            genericName?.includes(searchText)
          : true;

        return (
          isPriceMatch &&
          isAvailabilityMatch &&
          isBrandMatch &&
          isCategoryMatch &&
          isGenericMatch &&
          matchesSearchParam
        );
      });

      const sorted = [...filtered];
      if (sorting === "PriceLowToHigh") {
        sorted.sort(
          (a, b) =>
            (a.offerPrice || a.sellingPrice) - (b.offerPrice || b.sellingPrice)
        );
      } else if (sorting === "PriceHighToLow") {
        sorted.sort(
          (a, b) =>
            (b.offerPrice || b.sellingPrice) - (a.offerPrice || a.sellingPrice)
        );
      }

      setTimeout(() => {
        setFilteredProducts(sorted);
        setLoading(false);
      }, 200);
    };

    applyFilters();
  }, [
    activeProducts,
    priceRange,
    sorting,
    availability,
    selectedBrands,
    selectedCategories,
    selectedGenerics,
    searchParams,
    searchFilter,
    activeBrands,
    activeCategories,
    activeGenerics,
  ]);

  const handleBrandChange = (value) => {
    if (searchParams) {
      dispatch(resetFilter());
    }
    setSelectedBrands(value);
  };

  const handleCategoryChange = (value) => {
    if (searchParams) {
      dispatch(resetFilter());
    }
    setSelectedCategories(value);
  };

  const handleGenericChange = (value) => {
    if (searchParams) {
      dispatch(resetFilter());
    }
    setSelectedGenerics(value);
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
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
        {(() => {
          const toArray = (val) =>
            Array.isArray(val)
              ? val
              : typeof val === "string"
              ? val.split(",").map((v) => v.trim())
              : [];

          const allItems = [
            ...toArray(selectedBrands),
            ...toArray(selectedCategories),
            ...toArray(selectedGenerics),
          ];

          const uniqueItems = [...new Set(allItems.filter(Boolean))];

          return uniqueItems.length > 0
            ? `(${uniqueItems.join(", ")})`
            : "All Products";
        })()}
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
                    (product) => product?.brand?.name === brand?.name
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
                    (product) => product?.category?.name === category?.name
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
                  value={selectedGenerics}
                  onChange={handleGenericChange}
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
                  (product) => product?.category?.name === category.name
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
                value={selectedGenerics}
                onChange={handleGenericChange}
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
