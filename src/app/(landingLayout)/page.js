import Banner from "@/components/LandingPages/Home/Banner";
import Categories from "@/components/LandingPages/Home/Categories";
import NewsletterBanner from "@/components/LandingPages/Home/NewsletterBanner";
import NewArrivalProducts from "@/components/LandingPages/Home/Products/NewArrivalProducts";
import RecentlyViewedProducts from "@/components/LandingPages/Home/Products/RecentlyViewedProducts";

export const metadata = {
  title: "Home | Viscart",
  description: "This is the homepage of Viscart",
};

const page = async () => {
  return (
    <div className="overflow-x-hidden">
      <Banner />
      <NewArrivalProducts />
      <Categories />
      <RecentlyViewedProducts />
      <NewsletterBanner />
    </div>
  );
};

export default page;
