import { useGetAllBrandsQuery } from "@/redux/services/brand/brandApi";
import { useGetAllCategoriesQuery } from "@/redux/services/category/categoryApi";
import Link from "next/link";
import { useState } from "react";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { selectFilter, setFilter } from "@/redux/services/device/deviceSlice";

const CategoryBrandNavigation = ({ setIsDrawerOpen }) => {
  const dispatch = useDispatch();

  const { data: categories } = useGetAllCategoriesQuery();
  const { data: brands } = useGetAllBrandsQuery();
  const [activeTab, setActiveTab] = useState("categories");

  const searchParams = useSelector(selectFilter);

  const [openKeys, setOpenKeys] = useState([]);

  const toggleOpenKey = (key) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const itemClickHandler = (item) => {
    if (item) {
      dispatch(setFilter(item));
    }
  };

  const renderSubcategories = (subcategories) => {
    return subcategories.map((subcategory) => (
      <li key={subcategory._id} className="pl-6 mb-2">
        <Link href={`/products`} onClick={() => setIsDrawerOpen(false)}>
          <span
            className={`hover:text-orange duration-300 ${
              searchParams === `${subcategory.name}`
                ? "text-orange"
                : "text-white"
            }`}
            onClick={() => itemClickHandler(subcategory?.name)}
          >
            {subcategory.name}
          </span>
        </Link>
      </li>
    ));
  };

  const renderCategories = (categories) => {
    return categories.map((category) => (
      <div key={category._id} className="mt-3">
        <div
          className={`flex items-center justify-between cursor-pointer ml-3 my-4 duration-300 ${
            searchParams === `${category.name}` ? "text-orange" : "text-white"
          }`}
        >
          <Link
            href={`/products`}
            onClick={() => setIsDrawerOpen(false)}
            className={`hover:text-orange ${
              searchParams === `${category.name}` ? "text-orange" : "text-white"
            }`}
          >
            <span onClick={() => itemClickHandler(category?.name)}>
              {category.name}
            </span>
          </Link>
          {category.subcategories && category.subcategories.length > 0 && (
            <span
              className="text-sm text-white duration-300 hover:text-orange"
              onClick={() => toggleOpenKey(category._id)}
            >
              {openKeys.includes(category._id) ? (
                <RightOutlined className="-rotate-90" />
              ) : (
                <DownOutlined />
              )}
            </span>
          )}
        </div>
        {openKeys.includes(category._id) && (
          <ul className="mt-2">
            {renderSubcategories(category.subcategories)}
          </ul>
        )}
      </div>
    ));
  };

  const renderParentCategories = () => {
    if (!categories?.results) return null;

    return categories.results
      .filter((item) => item.level === "parentCategory")
      .map((parentCategory) => (
        <div key={parentCategory._id} className="mb-4">
          <div className="flex items-center justify-between cursor-pointer pt-3.5 font-medium odd:border-t">
            <Link href={`/products`} onClick={() => setIsDrawerOpen(false)}>
              <span
                className={`flex items-center gap-4 duration-300 hover:text-orange ${
                  searchParams === `${parentCategory.name}`
                    ? "text-orange"
                    : "text-white"
                }`}
                onClick={() => itemClickHandler(parentCategory?.name)}
              >
                <span>{parentCategory.name}</span>
              </span>
            </Link>
            {parentCategory.categories &&
              parentCategory.categories.length > 0 && (
                <span
                  className="text-sm text-white duration-300 hover:text-orange"
                  onClick={() => toggleOpenKey(parentCategory._id)}
                >
                  {openKeys.includes(parentCategory._id) ? (
                    <RightOutlined className="-rotate-90" />
                  ) : (
                    <DownOutlined />
                  )}
                </span>
              )}
          </div>
          {openKeys.includes(parentCategory._id) && (
            <ul>{renderCategories(parentCategory.categories)}</ul>
          )}
        </div>
      ));
  };

  return (
    <section className="mt-5">
      <div className="flex justify-center gap-5">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "categories"
              ? "border-b-2 border-orange text-orange"
              : "text-white"
          }`}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "brands"
              ? "border-b-2 border-orange text-orange"
              : "text-white"
          }`}
          onClick={() => setActiveTab("brands")}
        >
          Brands
        </button>
      </div>

      <div className="mt-4">
        {activeTab === "categories" && (
          <div className="flex flex-col">{renderParentCategories()}</div>
        )}
        {activeTab === "brands" && (
          <div className="flex flex-col">
            {brands?.results?.map((brand) => (
              <Link
                href={`/products`}
                onClick={() => setIsDrawerOpen(false)}
                key={brand._id}
                className={`py-4 font-medium odd:border-y hover:text-orange ${
                  searchParams === `${brand.name}`
                    ? "text-orange"
                    : "text-white"
                }`}
              >
                <p onClick={() => itemClickHandler(brand?.name)}>
                  {brand?.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryBrandNavigation;
