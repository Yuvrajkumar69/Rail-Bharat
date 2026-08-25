package com.genie.Train.repo;
import com.genie.Train.entity.TrainSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface TrainScheduleRepository extends JpaRepository<TrainSchedule,Long>{
    List<TrainSchedule> findBySource_StationCodeIgnoreCaseAndDestination_StationCodeIgnoreCase(String source,String destination);
    List<TrainSchedule> findBySource_StationNameIgnoreCaseAndDestination_StationNameIgnoreCase(String source,String destination);
}
