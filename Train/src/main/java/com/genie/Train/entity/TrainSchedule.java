package com.genie.Train.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name="train_schedules")
public class TrainSchedule {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional=false) @JoinColumn(name="train_id")
    @JsonIgnoreProperties("scheduleList")
    private Train train;
    @ManyToOne(optional=false) @JoinColumn(name="source_station_id")
    private Station source;
    @ManyToOne(optional=false) @JoinColumn(name="destination_station_id")
    private Station destination;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    @Column(nullable=false)
    private Integer totalSeats = 72;
    @Column(nullable=false)
    private Integer availableSeats = 72;
    @Column(nullable=false)
    private Double fare = 850.0;

    public TrainSchedule(){}
    public TrainSchedule(Long id,Train train,Station source,Station destination,String departureTime,String arrivalTime){
        this.id=id;this.train=train;this.source=source;this.destination=destination;
        this.departureTime=LocalTime.parse(departureTime);this.arrivalTime=LocalTime.parse(arrivalTime);
    }
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public Train getTrain(){return train;} public void setTrain(Train v){train=v;}
    public Station getSource(){return source;} public void setSource(Station v){source=v;}
    public Station getDestination(){return destination;} public void setDestination(Station v){destination=v;}
    public LocalTime getDepartureTime(){return departureTime;} public void setDepartureTime(LocalTime v){departureTime=v;}
    public LocalTime getArrivalTime(){return arrivalTime;} public void setArrivalTime(LocalTime v){arrivalTime=v;}
    public Integer getTotalSeats(){return totalSeats;} public void setTotalSeats(Integer v){totalSeats=v;}
    public Integer getAvailableSeats(){return availableSeats;} public void setAvailableSeats(Integer v){availableSeats=v;}
    public Double getFare(){return fare;} public void setFare(Double v){fare=v;}
}
