package com.genie.Train.payment;

public class PaymentResponse {

    private String orderId;
    private String keyId;
    private double amount;
    private String currency;
    private String message;

    public PaymentResponse() {
    }

    public PaymentResponse(
            String orderId,
            String keyId,
            double amount,
            String currency,
            String message
    ) {
        this.orderId = orderId;
        this.keyId = keyId;
        this.amount = amount;
        this.currency = currency;
        this.message = message;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(
            String orderId
    ) {
        this.orderId = orderId;
    }

    public String getKeyId() {
        return keyId;
    }

    public void setKeyId(
            String keyId
    ) {
        this.keyId = keyId;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(
            double amount
    ) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(
            String currency
    ) {
        this.currency = currency;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(
            String message
    ) {
        this.message = message;
    }
}