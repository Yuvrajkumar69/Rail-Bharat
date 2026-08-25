package com.genie.Train.controller;

import com.genie.Train.entity.TrainSchedule;
import com.genie.Train.service.TrainSearchService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/search")
public class TrainSearchController {
    private final TrainSearchService service;
    public TrainSearchController(TrainSearchService service){this.service=service;}

    @GetMapping("/by-code")
    public List<TrainSchedule> byCode(@RequestParam String sourceCode,@RequestParam String destinationCode){
        return service.search(sourceCode,destinationCode);
    }
    @GetMapping("/by-name")
    public List<TrainSchedule> byName(@RequestParam String source,@RequestParam String destination){
        return service.search(source,destination);
    }
}
