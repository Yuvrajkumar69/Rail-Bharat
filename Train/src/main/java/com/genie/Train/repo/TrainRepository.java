package com.genie.Train.repo;
import com.genie.Train.entity.Train;
import org.springframework.data.jpa.repository.JpaRepository;
public interface TrainRepository extends JpaRepository<Train,Long>{}
