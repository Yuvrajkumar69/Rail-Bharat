package com.genie.Train.booking;

public class BookingResponse {

    private String pnr;
    private Long scheduleId;
    private String passengerName;
    private Integer passengerCount;
    private String seatClass;
    private Double amount;
    private String paymentStatus;
    private String bookingStatus;

    private String trainName;
    private String trainNumber;
    private String sourceCode;
    private String destinationCode;
    private String departureTime;
    private String arrivalTime;

    public BookingResponse() {
    }

    public BookingResponse(
            String pnr,
            Long scheduleId,
            String passengerName,
            Integer passengerCount,
            String seatClass,
            Double amount,
            String paymentStatus,
            String bookingStatus
    ) {
        this.pnr = pnr;
        this.scheduleId = scheduleId;
        this.passengerName = passengerName;
        this.passengerCount = passengerCount;
        this.seatClass = seatClass;
        this.amount = amount;
        this.paymentStatus = paymentStatus;
        this.bookingStatus = bookingStatus;
    }

    public String getPnr() {
        return pnr;
    }

    public void setPnr(String pnr) {
        this.pnr = pnr;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public String getPassengerName() {
        return passengerName;
    }

    public void setPassengerName(String passengerName) {
        this.passengerName = passengerName;
    }

    public Integer getPassengerCount() {
        return passengerCount;
    }

    public void setPassengerCount(Integer passengerCount) {
        this.passengerCount = passengerCount;
    }

    public String getSeatClass() {
        return seatClass;
    }

    public void setSeatClass(String seatClass) {
        this.seatClass = seatClass;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public String getTrainName() {
        return trainName;
    }

    public void setTrainName(String trainName) {
        this.trainName = trainName;
    }

    public String getTrainNumber() {
        return trainNumber;
    }

    public void setTrainNumber(String trainNumber) {
        this.trainNumber = trainNumber;
    }

    public String getSourceCode() {
        return sourceCode;
    }

    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }

    public String getDestinationCode() {
        return destinationCode;
    }

    public void setDestinationCode(String destinationCode) {
        this.destinationCode = destinationCode;
    }

    public String getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(String departureTime) {
        this.departureTime = departureTime;
    }

    public String getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(String arrivalTime) {
        this.arrivalTime = arrivalTime;
    }
}