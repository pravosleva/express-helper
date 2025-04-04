// const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export const getDayOfWeek = ({ date }: {
  date: Date | number | undefined;
}) => new Date(date).toLocaleString("en", { weekday: "long" })
