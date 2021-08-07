import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppConfig from '../constants/config';
import { TOKEN_KEY } from '../constants';
import { isWeb } from '../constants/device';
import { Graph, GraphEdge, GraphNode } from '../types/graph';

const transport = axios.create({
  baseURL: AppConfig.apiUrl,
  withCredentials: true,
  responseType: 'json'
});

export function setToken(token: string) {
  transport.defaults.headers.common['x-auth-token'] = token;
}

function request(
  path: string,
  method: 'get' | 'post' | 'delete' | 'put' = 'get',
  data: Record<string, unknown> = {}
) {
  return AsyncStorage.getItem(TOKEN_KEY).then((token) => {
    return new Promise((resolve, reject) => {
      console.log('api: ', method.toUpperCase(), AppConfig.apiUrl, path);
      transport
        .request({
          method,
          headers: {
            'Content-type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'x-auth-token': token
          },
          data: method === 'get' ? undefined : data
        })
        .then((response) => resolve(response))
        .catch((error) => reject(error));
    });
  });
}

function get(path: string, data?: Record<string, unknown>) {
  return request(path, 'get', data);
}

function post(path: string, data?: Record<string, unknown>) {
  return request(path, 'post', data);
}

function put(path: string, data: Record<string, unknown>) {
  return request(path, 'put', data);
}

export function status() {
  return post('/api/user/status').catch((e) => {
    console.log(e);
    return null;
  });
}

export function login(email: string, password: string) {
  return post('/api/user/login', { email, password });
}

export function logout() {
  return post('/api/user/logout');
}

export function signup(
  name: string,
  email: string,
  password: string,
  passwordRepeat: string
) {
  return post('/api/user/signup', {
    name,
    email,
    password,
    password2: passwordRepeat,
    score: 100
  });
}

export function getGraph(id: string) {
  return get(`/api/graphs/${id}`);
}

export function saveGraph(id: string, graph: Graph) {
  if (id === null) return put('/api/graphs/new', graph);
  return post(`/api/graphs/${id}`, graph);
}

export function getGraphPreviewURL(id: string) {
  return (
    AppConfig.apiUrl + `/api/graphs/${id}/preview.${isWeb ? 'svg' : 'png'}`
  );
}

export function getUserGraphs(id: string) {
  if (id !== undefined) return post(`/api/user/${id}/graphs`);
  return post('/api/user/graphs'); // me
}

export function createNode(graphId: string, node: GraphNode) {
  return post(`/api/graphs/${graphId}/nodes/`, node);
}

export function createEdge(graphId: string, edge: GraphEdge) {
  return post(`/api/graphs/${graphId}/edges/`, edge);
}

export function updateNode(node: GraphNode) {
  return post(`/api/nodes/${node._id}`, node);
}
