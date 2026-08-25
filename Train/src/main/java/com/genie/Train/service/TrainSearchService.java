package com.genie.Train.service;
import com.genie.Train.entity.TrainSchedule;
import com.genie.Train.repo.TrainScheduleRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TrainSearchService {
    private final TrainScheduleRepository repo;
    public TrainSearchService(TrainScheduleRepository repo){this.repo=repo;}
    public List<TrainSchedule> search(String source,String destination){
        if(source==null||destination==null) return List.of();
        String s=source.trim(), d=destination.trim();
        List<TrainSchedule> result=repo.findBySource_StationCodeIgnoreCaseAndDestination_StationCodeIgnoreCase(s,d);
        if(result.isEmpty()) result=repo.findBySource_StationNameIgnoreCaseAndDestination_StationNameIgnoreCase(s,d);
        return result;
    }
}
