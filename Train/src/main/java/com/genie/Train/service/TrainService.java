package com.genie.Train.service;
import com.genie.Train.entity.Train;
import com.genie.Train.repo.TrainRepository;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class TrainService {
    private final TrainRepository repo;
    public TrainService(TrainRepository repo){this.repo=repo;}
    public List<Train> getAllTrains(){return repo.findAll();}
    public Train addTrain(Train t){return repo.save(t);}
    public Train getTrainById(Long id){return repo.findById(id).orElse(null);}
}
