export type Recipe = {
  id: string;
  title: string;
  category: string;
  ingredients: string;
  image: string;
};
export type RootStackParamList = {
  Home: undefined;
  AddRecipe: undefined;
};