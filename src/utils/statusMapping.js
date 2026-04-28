export const statusCode = {
  CMP : "CMP",
  ON  : "ON",
  FLD : "FLD",
  END : "END",
  CNF : "CNF",
  PNR : "PNR",
  C   : "C",
}

export const statusMapping = {
  [statusCode.CMP] : "Completed",
  [statusCode.ON]  : "On Going",
  [statusCode.FLD] : "Failed",
  [statusCode.END] : "Stopped",
  [statusCode.CNF] : "Booking Confirmed",
  [statusCode.PNR] : "Incomplete Booking",
  [statusCode.C]   : "Cancelled"
};
