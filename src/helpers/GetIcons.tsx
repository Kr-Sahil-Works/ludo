import { Colors } from "../constants/Colors";

type ImageType = {
  name: string | number;
  image: any;
};

export class BackgroundImage {
  private static images: ImageType[] = [
    { name: 1, image: require("../assets/images/dice/dice1.png") },
    { name: 2, image: require("../assets/images/dice/dice2.png") },
    { name: 3, image: require("../assets/images/dice/dice3.png") },
    { name: 4, image: require("../assets/images/dice/dice4.png") },
    { name: 5, image: require("../assets/images/dice/dice5.png") },
    { name: 6, image: require("../assets/images/dice/dice6.png") },

    { name: Colors.green, image: require("../assets/images/piles/green_1024.png") },
    { name: Colors.red, image: require("../assets/images/piles/red_1024.png") },
    { name: Colors.yellow, image: require("../assets/images/piles/yellow_1024.png") },
    { name: Colors.blue, image: require("../assets/images/piles/blue_1024.png") },
  ];

  static GetImage = (name: string | number) => {
    const found = BackgroundImage.images.find((e) => e.name === name);
    return found ? found.image : null;
  };
}
