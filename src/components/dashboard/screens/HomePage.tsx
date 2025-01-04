import AllDecks from "@/components/marketplace/AllDecks";
import CategoryGrid from "@/components/marketplace/CategoryGrid";

const Home = () => {
  return (
    <div className="flex-1 overflow-auto space-y-8 px-6 pb-6">
      <CategoryGrid />
      <AllDecks />
    </div>
  );
};

export default Home;
