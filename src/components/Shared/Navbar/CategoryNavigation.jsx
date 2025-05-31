import { useGetAllCategoriesQuery } from "@/redux/services/category/categoryApi";
import { resetFilter, setFilter } from "@/redux/services/device/deviceSlice";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Menu, Dropdown } from "antd";
import Link from "next/link";
import React from "react";
import { useDispatch } from "react-redux";

const CategoryNavigation = ({ setDrawer }) => {
  const dispatch = useDispatch();
  const { data: categories } = useGetAllCategoriesQuery();

  const handleCloseDrawer = () => {
    if (setDrawer) {
      setDrawer(false);
    }
  };

  const itemClickHandler = (item) => {
    if (item?.name) {
      dispatch(setFilter(item?.name));
    }
    if (item === "all") {
      dispatch(resetFilter());
    }
  };

  const renderSubcategories = (category) => {
    if (category?.subcategories && category?.subcategories.length > 0) {
      return (
        <Menu>
          {category.subcategories.map((subCategory) => (
            <Menu.Item key={subCategory?._id} onClick={handleCloseDrawer}>
              <Link href={`/products`}>
                <span onClick={() => itemClickHandler(subCategory)}>
                  {subCategory?.name}
                </span>
                {subCategory?.subcategories &&
                  subCategory?.subcategories.length > 0 && (
                    <RightOutlined className="ml-2" />
                  )}
              </Link>
            </Menu.Item>
          ))}
        </Menu>
      );
    }
    return null;
  };

  const renderCategories = (parentCategory) => {
    return (
      <Menu>
        {parentCategory?.categories?.map((category) => (
          <Menu.SubMenu
            key={category?._id}
            title={
              <div onClick={handleCloseDrawer}>
                <Link href={`/products`} className="flex items-center">
                  <p onClick={() => itemClickHandler(category)}>
                    {category?.name}
                  </p>
                </Link>
              </div>
            }
          >
            {renderSubcategories(category)}
          </Menu.SubMenu>
        ))}
      </Menu>
    );
  };

  const renderParentCategories = () => {
    return categories?.results
      ?.filter((item) => item?.level === "parentCategory")
      .map((parentCategory) => (
        <Dropdown
          key={parentCategory?._id}
          overlay={renderCategories(parentCategory)}
          trigger={["hover"]}
        >
          <div onClick={handleCloseDrawer}>
            <Link
              href={`/products`}
              className="flex items-center cursor-pointer"
            >
              <span onClick={() => itemClickHandler(parentCategory)}>
                {parentCategory?.name}
              </span>
              {parentCategory?.categories &&
                parentCategory?.categories.length > 0 && (
                  <DownOutlined className="!text-sm" />
                )}
            </Link>
          </div>
        </Dropdown>
      ));
  };

  return (
    <div className="my-container">
      <div className="flex flex-col lg:flex-row gap-5 lg:items-center flex-wrap justify-center py-5">
        <div onClick={handleCloseDrawer}>
          <Link href={"/offers"}>
            <p onClick={() => itemClickHandler("all")}>Offers</p>
          </Link>
        </div>
        <div onClick={handleCloseDrawer} className="-mb-5 lg:-mb-0">
          <Link href={"/products"}>
            <p onClick={() => itemClickHandler("all")}>All Products</p>
          </Link>
        </div>
        <span className="hidden lg:block">|</span>
        <span className="lg:hidden"></span>
        {renderParentCategories()}
      </div>
    </div>
  );
};

export default CategoryNavigation;
