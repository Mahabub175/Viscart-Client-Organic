import { formatImagePath } from "@/utilities/lib/formatImagePath";
import { Input, Spin } from "antd";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ProductSearchBar = ({
  products,
  globalData,
  isMobile,
  setDrawerOpen,
  setIsSearchOpen,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const handleSearch = (value) => {
    setSearchValue(value);
    setIsFiltering(true);
    if (!value) {
      setFilteredOptions([]);
      setIsFiltering(false);
      return;
    }

    setTimeout(() => {
      const results =
        Array.isArray(products?.results) &&
        products?.results?.filter(
          (product) =>
            product?.name?.toLowerCase().includes(value.toLowerCase()) ||
            product?.category?.name?.toLowerCase().includes(value.toLowerCase())
        );

      setFilteredOptions(results || []);
      setIsFiltering(false);
    }, 300);
  };

  const handleBlur = () => {
    setTimeout(() => setIsFocused(false), 150);
  };

  const handleProductClick = () => {
    setSearchValue("");
    setFilteredOptions([]);
    setIsFocused(false);
    setDrawerOpen(false);
    setIsSearchOpen(false);
  };

  return (
    <div className={`${isMobile && "hidden lg:block"} w-full`}>
      <div className="relative w-full">
        <Input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder="Search for Products..."
          className="w-full rounded-full"
          size="large"
          prefix={<FaSearch className="text-primary" />}
        />

        <AnimatePresence>
          {isFiltering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg w-full mt-1 lg:mt-2 p-4 text-gray-500 flex justify-center items-center"
            >
              <Spin />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFocused && searchValue && !isFiltering && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg w-full mt-1 lg:mt-2 max-h-[35rem] overflow-y-auto"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.slice(0, 10).map((product) => (
                  <Link
                    key={product.slug}
                    href={`/products/${product?.slug}`}
                    onClick={handleProductClick}
                    className="flex items-center gap-4 hover:text-primary duration-300 p-4 border-b border-b-gray-200"
                  >
                    <Image
                      src={formatImagePath(product?.mainImage)}
                      alt="product"
                      width={80}
                      height={50}
                      className="object-cover rounded-xl"
                    />
                    <div>
                      <p className="text-lg font-medium">{product?.name}</p>
                      <p className="flex items-center gap-4">
                        Price:{" "}
                        {product?.offerPrice > 0 && (
                          <span className="text-xs line-through text-red-500">
                            {globalData?.results?.currency +
                              " " +
                              product?.sellingPrice}
                          </span>
                        )}
                        <span className="text-xs lg:text-sm">
                          {globalData?.results?.currency +
                            " " +
                            (product?.offerPrice > 0
                              ? product?.offerPrice
                              : product?.sellingPrice)}
                        </span>
                      </p>
                      <p>Category: {product?.category?.name}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-gray-500 p-4">
                  No products found
                </p>
              )}
              {filteredOptions.length > 10 && (
                <Link
                  href="/products"
                  className="block text-center text-primary py-2 hover:bg-gray-100"
                >
                  View All
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductSearchBar;
