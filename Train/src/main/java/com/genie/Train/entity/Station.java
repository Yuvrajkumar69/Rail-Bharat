package com.genie.Train.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "stations")
public class Station {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Size(max = 100) @Column(nullable = false)
    private String stationName;
    @NotBlank @Size(min = 2, max = 10) @Column(nullable = false, unique = true)
    private String stationCode;

    public Station() {}
    public Station(Long id, String stationCode, String stationName) {
        this.id=id; this.stationCode=stationCode; this.stationName=stationName;
    }
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getStationName(){return stationName;} public void setStationName(String v){stationName=v;}
    public String getStationCode(){return stationCode;} public void setStationCode(String v){stationCode=v;}
}
