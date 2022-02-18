



const histogram = {

  get_bin_height(bin){
     return d3.sum(bin, data_point=>data_point.count)
  },
  setup(data, base_node){

    this.margin = {top: 50, right: 30, bottom: 30, left: 50},


    this.width = 750 - this.margin.left - this.margin.right,
    this.height = 300 - this.margin.top - this.margin.bottom;

    this.base_node = base_node

    this.data=data

    years = data.years
    this.active_year = years[0]
    this.active_region = this.active_year.regions[0]

    this.year_strings =[]
    this.region_strings =[]


    for(let year of data.years){
      this.year_strings.push(year.year)
    }
    for(let region of this.active_year.regions){
      this.region_strings.push(region.name[0])
    }

    this.active_year_string = this.year_strings[0]
    this.active_region_string = this.region_strings[0]

    //console.log(this.year_strings )
    //console.log(this.active_region_string )

    this.active_bin_count = 20

    max_distance = find_max_distance(data)

    this.x_scale = d3.scaleLinear()
      //.domain([0,  max_distance])
      .domain([0,  700])
      .range([0, this.width])


    this.bin_gen = d3.bin()
      .domain([0, max_distance])
      .thresholds(this.x_scale.ticks(this.active_bin_count))
      .value(d=>d.distance)


    for(let year of data.years){
      for(let region of year.regions){
        region.data = this.bin_gen(region.data)
      }
    }


    //console.log(data)

    const get_max_bin_height = data => {
      let max_bin_height= 0
      for(let year of data.years){
        for(let region of year.regions){
          for(let bin of region.data){
            bin_height=this.get_bin_height(bin)
            max_bin_height = Math.max(max_bin_height, bin_height );
          }
        }
      }
      return max_bin_height
    }

    max_bin_height = get_max_bin_height(data)

    //console.log(max_bin_height)

    this.active_bins = this.active_region.data
    //console.log(this.active_bins)



    this.y_scale = d3.scaleLinear()
    .range([this.height,0])
    .domain([0, max_bin_height])

    //const range = base_node.append("range")

    //range.attr("min", 2014)
    //.attr("max", 2020)
    const year_select = base_node.append("select").attr("id", "year_select")

    year_select
      .selectAll("option")
      .data(this.year_strings)
      .enter()
      .append("option")
      .text(d=>d)
      .attr("value", d=>d)

      year_select.on("change", d=>{
        var selectedOption = d3.select("#year_select").property("value")
        this.set_year(selectedOption)
      })

    const region_select = base_node.append("select").attr("id", "region_select")

    region_select
      .selectAll("option")
      .data(this.region_strings)
      .enter()
      .append("option")
      .text(d=>d)
      .attr("value", d=>d)

      region_select.on("change", d=>{
        var selectedOption = d3.select("#region_select").property("value")
        this.set_region(selectedOption)
      })


    this.svg = base_node.append('svg')
      .attr("viewBox", `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`)
      .classed("svg-content-responsive", true)
      .append("g")
      .attr("transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.svg.append("g")
      .call(d3.axisLeft(this.y_scale))

    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x_scale));
    
    this.bar_group=this.svg.append("g")

  },


  render(){
    empty_data=[]
    this.bar_group.selectAll("rect").data(empty_data).exit().remove()

    //console.log(this.data.years)
    //console.log(this.active_year_string)
    this.active_year = this.data.years.filter(year => year.year == this.active_year_string)[0]
    //console.log(this.active_year)
    this.active_region = this.active_year.regions.filter(region => region.name == this.active_region_string)[0]
    //console.log(this.active_region)
    //console.log(this.active_region_string)
    this.active_bins = this.active_region.data

    this.bar_group.selectAll("rect").data(this.active_bins).enter()
    .append("rect")
    .attr("transform", (bin) => { 
      return "translate(" + this.x_scale(bin.x0) + "," + this.y_scale(this.get_bin_height(bin)) + ")"; })
    .attr("width", (bin) => { return this.x_scale(bin.x1) - this.x_scale(bin.x0) -1 ; })
    .attr("height", (bin) => { return this.height - this.y_scale(this.get_bin_height(bin)); })
    .style("fill", "#69b3a2")
  },


  set_region(region){
    console.log("setting region ", region)
    this.active_region_string = region
    this.render()
  },

  set_year(year){
    //console.log("setting year: ", this.active_region_string)
    console.log("setting year: ", year)
    this.active_year_string = year
    this.render()
  }

}

function find_max_distance(data){
  let max_distance = 0
  for(let year of data.years){
    for(let region of year.regions){
      for(let data_point of region.data){
        max_distance = Math.max(max_distance, data_point.distance );
      }
    }
  }
  return max_distance
}


const container = d3.select('#root')
  .classed('container', true)

d3.json("data.json").then(json_data => {
  histogram.setup(json_data, container)
  histogram.render()
  //histogram.render()

})

