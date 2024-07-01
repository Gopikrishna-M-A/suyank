function getFileExtFromName(name: string) {
  return name.split(".").pop();
}

export default getFileExtFromName;
