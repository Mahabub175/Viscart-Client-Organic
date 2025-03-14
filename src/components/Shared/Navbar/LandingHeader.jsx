/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useGetAllGlobalSettingQuery } from "@/redux/services/globalSetting/globalSettingApi";
import { useGetAllProductsQuery } from "@/redux/services/product/productApi";
import { formatImagePath } from "@/utilities/lib/formatImagePath";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import { AutoComplete, Avatar, Button, Drawer, Popover } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaHeart, FaSearch, FaShoppingBag, FaUser } from "react-icons/fa";
import { FaCodeCompare } from "react-icons/fa6";
import CategoryNavigation from "./CategoryNavigation";
import { useDispatch, useSelector } from "react-redux";
import { logout, useCurrentUser } from "@/redux/services/auth/authSlice";
import { useDeviceId } from "@/redux/services/device/deviceSlice";
import { useGetSingleUserQuery } from "@/redux/services/auth/authApi";
import { useGetSingleCompareByUserQuery } from "@/redux/services/compare/compareApi";
import { useGetSingleWishlistByUserQuery } from "@/redux/services/wishlist/wishlistApi";
import DrawerCart from "../Product/DrawerCart";
import { GiCancel } from "react-icons/gi";
import { useGetSingleCartByUserQuery } from "@/redux/services/cart/cartApi";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { IoMdArrowDropdown } from "react-icons/io";
import logo from "@/assets/images/logo-white.png";

const LandingHeader = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const dispatch = useDispatch();
  const user = useSelector(useCurrentUser);
  const deviceId = useSelector(useDeviceId);
  const { data } = useGetSingleUserQuery(user?._id);
  const { data: compareData } = useGetSingleCompareByUserQuery(
    user?._id ?? deviceId
  );
  const { data: wishListData } = useGetSingleWishlistByUserQuery(
    user?._id ?? deviceId
  );
  const { data: cartData, refetch } = useGetSingleCartByUserQuery(
    user?._id ?? deviceId
  );

  const { data: globalData } = useGetAllGlobalSettingQuery();
  const { data: products } = useGetAllProductsQuery(undefined, {
    skip: !isSearchOpen,
  });

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully!");
  };

  const links = {
    Dashboard: `/${data?.role}/dashboard`,
    Order: `/${data?.role}/orders/order`,
    Profile: `/${data?.role}/account-setting`,
    Wishlist: `/${data?.role}/orders/wishlist`,
    Cart: `/${data?.role}/orders/cart`,
  };

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY) {
      setShowNavbar(false);
    } else {
      setShowNavbar(true);
    }
    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const content = (
    <div>
      <div className="rounded-md px-16 py-3">
        <div className="flex flex-col items-start gap-4 text-md">
          {["Dashboard", "Order", "Profile", "Wishlist", "Cart"].map(
            (item, index) => (
              <Link
                key={index}
                href={links[item]}
                className={`gap-2 font-bold duration-300 ${
                  pathname === links[item]
                    ? "text-primary hover:text-primary"
                    : "text-black hover:text-primary"
                }`}
              >
                {item}
              </Link>
            )
          )}
        </div>
      </div>

      <div className="flex w-full justify-end pt-3">
        <Button
          onClick={handleLogout}
          className={`w-full font-bold`}
          size="large"
          type="primary"
        >
          Log Out
        </Button>
      </div>
    </div>
  );

  const handleSearch = (value) => {
    if (!value) {
      setOptions([]);
      return;
    }

    const filteredOptions = products?.results?.filter(
      (product) =>
        product?.name?.toLowerCase().includes(value.toLowerCase()) ||
        product?.category?.name?.toLowerCase().includes(value.toLowerCase())
    );

    setOptions(
      filteredOptions?.map((product) => ({
        value: product.name,
        label: (
          <Link
            href={`/products/${product?.slug}`}
            className="flex items-center gap-4 hover:text-primary pb-2 border-b border-b-gray-300"
          >
            <Image
              src={formatImagePath(product?.mainImage)}
              alt="product"
              width={80}
              height={50}
              className="object-cover rounded-xl"
            />
            <div className="ml-2">
              <p className="text-lg font-medium">{product?.name}</p>
              <p>
                Price: {globalData?.results?.currency}{" "}
                {product?.offerPrice
                  ? product?.offerPrice
                  : product?.sellingPrice}
              </p>
              <p>Category: {product?.category?.name}</p>
            </div>
          </Link>
        ),
      })) || []
    );
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full bg-white shadow-md transition-transform duration-300 z-50 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div
        className={`bg-primary py-2 text-center text-white px-2 text-sm md:text-base ${
          lastScrollY > 0 ? "hidden" : ""
        }`}
      >
        To order any product, please call or whatsapp us at{" "}
        <span className="font-semibold">
          {globalData?.results?.businessWhatsapp}
        </span>
      </div>
      <nav className="my-container px-2 -my-5 lg:-my-2">
        <div className="flex justify-around items-center">
          <Button
            type="text"
            className="lg:hidden"
            icon={<MenuOutlined />}
            onClick={toggleDrawer}
          />
          <div>
            <FaSearch
              className="cursor-pointer hover:text-primary duration-300 hidden lg:block text-xl text-primary"
              onClick={() => setIsSearchOpen(true)}
            />
          </div>
          <Link href={"/"} className="flex flex-[1] lg:flex-none lg:ml-10 py-4">
            <Image
              src={globalData?.results?.logo ?? logo}
              alt="logo"
              width={100}
              height={100}
              className="lg:w-full lg:h-full w-fit h-fit"
            />
          </Link>

          <div className="flex gap-6 items-center text-lg">
            <FaSearch
              className="cursor-pointer hover:text-primary duration-300 lg:hidden"
              onClick={() => setIsSearchOpen(true)}
            />
            {user?._id ? (
              <>
                {" "}
                <div className="flex items-center gap-2">
                  <Popover
                    placement="bottomRight"
                    content={content}
                    className="cursor-pointer flex items-center gap-1"
                  >
                    {data?.profile_image ? (
                      <Image
                        src={data?.profile_image}
                        alt="profile"
                        height={40}
                        width={40}
                        className="rounded-full w-[40px] h-[40px] border-2 border-primary"
                      />
                    ) : (
                      <Avatar className="" size={40} icon={<UserOutlined />} />
                    )}
                    <h2 className="font-semibold">{data?.name ?? "User"}</h2>
                    <IoMdArrowDropdown />
                  </Popover>
                </div>
              </>
            ) : (
              <>
                <Link href={"/sign-in"}>
                  <FaUser className="cursor-pointer hover:text-primary duration-300" />
                </Link>
              </>
            )}

            <Link href={"/compare"} className="hidden lg:flex">
              {compareData?.[0]?.product?.length > 0 ? (
                <span className="relative">
                  <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {compareData?.[0]?.product?.length}
                  </span>
                  <FaCodeCompare className="cursor-pointer rotate-90 hover:text-primary duration-300" />
                </span>
              ) : (
                <FaCodeCompare className="cursor-pointer rotate-90 hover:text-primary duration-300" />
              )}
            </Link>
            <Link href={"/wishlist"} className="hidden lg:flex">
              {wishListData?.length > 0 ? (
                <span className="relative">
                  <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {wishListData?.length}
                  </span>
                  <FaHeart className="cursor-pointer hover:text-primary duration-300" />
                </span>
              ) : (
                <FaHeart className="cursor-pointer hover:text-primary duration-300" />
              )}
            </Link>
            <div className="hidden lg:flex">
              {cartData?.length > 0 ? (
                <span className="relative">
                  <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {cartData?.length}
                  </span>
                  <FaShoppingBag
                    className="cursor-pointer hover:text-primary duration-300"
                    onClick={() => setIsCartOpen(true)}
                  />
                </span>
              ) : (
                <FaShoppingBag
                  className="cursor-pointer hover:text-primary duration-300"
                  onClick={() => setIsCartOpen(true)}
                />
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="hidden lg:flex gap-6 items-center bg-grey">
        <CategoryNavigation />
      </div>
      <Drawer
        placement="left"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        <div className="flex justify-between items-center -mt-5 mb-5">
          <Link href={"/"}>
            <Image
              src={globalData?.results?.logo}
              alt="logo"
              width={80}
              height={80}
            />
          </Link>
          <button
            className="mt-1 bg-gray-200 hover:scale-110 duration-500 rounded-full p-1"
            onClick={() => setIsDrawerOpen(false)}
          >
            <GiCancel className="text-xl text-gray-700" />
          </button>
        </div>
        <CategoryNavigation />
      </Drawer>
      <Drawer
        open={isSearchOpen}
        onCancel={() => setIsSearchOpen(false)}
        footer={null}
        keyboard={true}
        destroyOnClose
        placement="top"
        height={200}
      >
        <div className="flex justify-between items-center -mt-2">
          <div></div>
          <button
            className="mt-1 bg-gray-200 hover:scale-110 duration-500 rounded-full p-1"
            onClick={() => setIsSearchOpen(false)}
          >
            <GiCancel className="text-xl text-gray-700" />
          </button>
        </div>
        <div className="p-5 flex items-center justify-between gap-10">
          <Link href={"/"} className="hidden lg:flex">
            <Image
              src={globalData?.results?.logo}
              alt="logo"
              width={80}
              height={80}
            />
          </Link>
          <div className="relative w-full">
            <AutoComplete
              options={options}
              onSearch={handleSearch}
              placeholder="Search for Products..."
              size="large"
              className="w-full"
            />
            <FaSearch className="absolute right-8 top-1/2 -translate-y-1/2 text-primary text-xl" />
          </div>
          <div className="hidden lg:flex">
            {cartData?.length > 0 ? (
              <span className="relative">
                <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {cartData?.length}
                </span>
                <FaShoppingBag
                  className="cursor-pointer hover:text-primary duration-300 text-2xl"
                  onClick={() => setIsCartOpen(true)}
                />
              </span>
            ) : (
              <FaShoppingBag
                className="cursor-pointer hover:text-primary duration-300 text-2xl"
                onClick={() => setIsCartOpen(true)}
              />
            )}
          </div>
        </div>
      </Drawer>
      <Drawer
        placement="right"
        onClose={() => setIsCartOpen(false)}
        open={isCartOpen}
        width={450}
        keyboard={true}
        destroyOnClose
      >
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <p className="lg:text-2xl font-semibold">Shopping Cart</p>
          <button
            className="mt-1 bg-gray-200 hover:scale-110 duration-500 rounded-full p-1"
            onClick={() => setIsCartOpen(false)}
          >
            <GiCancel className="text-xl text-gray-700" />
          </button>
        </div>
        <DrawerCart data={cartData} refetch={refetch} />
      </Drawer>
    </header>
  );
};

export default LandingHeader;
