import React, { Component } from 'react';
import { Card, CardSection, Button } from '../common';
import { Image, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { addToActiveList } from '../../actions';

class DetailPage extends Component {

  render() {
    const { address, name, price, rating, thumb, categories, location } = this.props.selectedRestaurant;
    const { thumbnailStyle } = styles;
    const lastItemInCategories = categories.slice(-1)[0];

    return (
      <Card>
        <CardSection>
          <Image
            source={{ uri: thumb }}
            style={thumbnailStyle}
          />
          <Text>{name}</Text>
        </CardSection>

        <CardSection>
          <Button onPress={() => {this.props.addToActiveList(this.props.selectedRestaurant)}}>Add to List</Button>
        </CardSection>

        <CardSection>
          <Text>Address: { address[0] }</Text>
        </CardSection>

        <CardSection>
          <Text>Categories: { categories.map(category => {
              if(category === lastItemInCategories) {
                return (
                  <Text key={category}>{category}</Text>
                )
              }
              return (<Text key={category}>{(category + ',')}</Text>)}) }</Text>
        </CardSection>
      </Card>
    )
  }
}

const styles = {
  thumbnailStyle: {
    width: 100,
    height:100,
  }
}

const mapStateToProps = (state) => {
    return { selectedRestaurant: state.searchInput.selectedRestaurant };
}

export default connect(mapStateToProps, { addToActiveList })(DetailPage)
