package com.genie.Train.controller;
import com.genie.Train.entity.Train;
import com.genie.Train.service.TrainService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/trains")
public class TrainController {
    private final TrainService service;
    public TrainController(TrainService service){this.service=service;}
    @GetMapping public List<Train> all(){return service.getAllTrains();}
    @GetMapping("/{id}") public Train one(@PathVariable Long id){return service.getTrainById(id);}
    @PostMapping public Train add(@Valid @RequestBody Train t){t.setId(null);return service.addTrain(t);}
}
