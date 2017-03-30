import React, { Component } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { Card, CardSection } from '../common';
import { setSelectedRestaurant } from '../../actions';

const styles = {
  headerContentStyle: {
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  headerTextStyle: {
    fontSize: 18
  },
  thumbnailStyle: {
    height: 50,
    width: 50,
  },
  thumbnailContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  imageStyle: {
    height: 300,
    flex: 1,
    width: null,
  }
};

class SearchResults extends Component {

  onResultPress(item) {
    this.props.setSelectedRestaurant(item)
  }

  showResults() {
    if(this.props.searchResults) {
      return(
        <View>
        {this.props.searchResults.map(item => (
          <TouchableOpacity key={item.name} onPress={() => this.onResultPress(item)}>
            <CardSection>
              <View style={styles.thumbnailContainerStyle}>
                <Image
                  source={{ uri: item.thumb }}
                  style={styles.thumbnailStyle}
                />
              </View>
              <View style={styles.headerContentStyle}>
                <Text style={styles.headerTextStyle}>{item.name}</Text>
                <Text>Price: {item.price}</Text>
              </View>
            </CardSection>
          </TouchableOpacity>
        ))}
        </View>
      )
    }
    return (
      <Text>Search for Restaurants!</Text>
    )
  }

  render() {
    return (
      <View>{this.showResults()}</View>
    )
  }
}

const mapStateToProps = (state) => {
  return { searchResults: state.searchInput.searchResults };
}

export default connect(mapStateToProps, { setSelectedRestaurant })(SearchResults);
