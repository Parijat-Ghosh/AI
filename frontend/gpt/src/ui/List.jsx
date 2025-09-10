import AnimatedList from "../components/AnimatedList";

const items = ["Item 1", "Item 2", "Item 3"];

export default function Home() {
  return (
    <AnimatedList
      items={items}
      onItemSelect={(item, index) => console.log(item, index)}
      showGradients={true}
      enableArrowNavigation={true}
      displayScrollbar={true}
    />
  );
}
