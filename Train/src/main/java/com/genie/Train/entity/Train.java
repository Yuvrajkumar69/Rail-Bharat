package com.genie.Train.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="trains")
public class Train {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Column(nullable=false, unique=true)
    private String trainNumber;
    @NotBlank @Column(nullable=false)
    private String trainName;

    @OneToMany(mappedBy="train", cascade=CascadeType.ALL, orphanRemoval=true)
    @JsonIgnore
    private List<TrainSchedule> scheduleList = new ArrayList<>();

    public Train(){}
    public Train(Long id,String trainName,String trainNumber,List<TrainSchedule> scheduleList){
        this.id=id; this.trainName=trainName; this.trainNumber=trainNumber;
        if(scheduleList!=null) this.scheduleList=scheduleList;
    }
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getTrainNumber(){return trainNumber;} public void setTrainNumber(String v){trainNumber=v;}
    public String getTrainName(){return trainName;} public void setTrainName(String v){trainName=v;}
    public List<TrainSchedule> getScheduleList(){return scheduleList;} public void setScheduleList(List<TrainSchedule> v){scheduleList=v;}
}
