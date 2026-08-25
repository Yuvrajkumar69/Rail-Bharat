package com.genie.Train.repo;
import com.genie.Train.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface StationRepository extends JpaRepository<Station,Long>{
    Optional<Station> findByStationCodeIgnoreCase(String code);
    Optional<Station> findByStationNameIgnoreCase(String name);
    boolean existsByStationCodeIgnoreCase(String code);
}
