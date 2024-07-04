export const createQueryString = (
  name: string,
  value: any,
  searchParams: any,
) => {
  const params = new URLSearchParams(searchParams?.toString());
  if (value) {
    params.set(name, value);
  } else {
    params.delete(name);
  }

  return params.toString();
};
