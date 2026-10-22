export const statusCode = {
  CMP : "CMP",
  ON  : "ON",
  FLD : "FLD",
  END : "END",
  CNF : "CNF",
  PNR : "PNR",
  C   : "C",
}

export const formatIndianNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value;
  }

  return number.toLocaleString("en-IN");
};

export const statusMapping = {
  [statusCode.CMP] : "Completed",
  [statusCode.ON]  : "On Going",
  [statusCode.FLD] : "Failed",
  [statusCode.END] : "Stopped",
  [statusCode.CNF] : "Booking Confirmed",
  [statusCode.PNR] : "Incomplete Booking",
  [statusCode.C]   : "Cancelled"
};
