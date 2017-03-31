import React from 'react';
import { ScrollView } from 'react-native';
import { Card, CardSection, Button } from '../common';
import { Actions } from 'react-native-router-flux';
import SearchBar from './SearchBar';
import SearchButton from './SearchButton';
import SearchResults from './SearchResults'

export default SearchPage = () => (
  <ScrollView>
    <Card>
      <Button onPress={() => {Actions.ActiveList()}}>Active List</Button>
      <SearchBar />
      <SearchButton />
    </Card>
    <Card>
      <SearchResults />
    </Card>
  </ScrollView>
);
