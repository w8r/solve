import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppConfig from '../constants/config';
import { TOKEN_KEY } from '../constants';
import { isWeb } from '../constants/device';
import { Graph, GraphEdge, GraphNode } from '../types/graph';
import { User } from '../contexts/AuthContext';

import { FacebookAuthUser, GoogleAuthUser } from '../types/user';

const transport = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  responseType: 'json',
  baseURL: AppConfig.apiUrl
});

export function setHeaderToken(token: string | undefined) {
  //transport.defaults.headers.common[TOKEN_KEY] = token;
  transport.defaults.headers.common['authorization'] = token
    ? `Bearer ${token}`
    : undefined;
}

function request<T>(
  path: string,
  method: 'get' | 'post' | 'delete' | 'put' = 'get',
  data: Record<string, unknown> = {}
): Promise<T> {
  return AsyncStorage.getItem(TOKEN_KEY).then((token) => {
    return new Promise((resolve, reject) => {
      console.log(
        '%c api: ',
        'color: white; background-color: blue',
        method.toUpperCase(),
        AppConfig.apiUrl + path
      );
      transport
        .request({
          url: path,
          method,
          headers: {
            authorization: `Bearer ${token}`
          },
          data: method === 'get' ? undefined : data
        })
        .then((response) => resolve(response.data as unknown as T))
        .catch((error) => reject(error.response.data));
    });
  });
}

function get<T>(path: string, data?: Record<string, unknown>) {
  return request<T>(path, 'get', data);
}

function post<T>(path: string, data?: Record<string, unknown>): Promise<T> {
  return request<T>(path, 'post', data);
}

function put<T>(path: string, data: Record<string, unknown>) {
  return request<T>(path, 'put', data);
}

export function status() {
  return post('/api/user/status').catch((err) => {
    setHeaderToken(undefined);
    return AsyncStorage.setItem(TOKEN_KEY, '');
  });
}

export function login(email: string, password: string): Promise<User> {
  return post<User>('/api/auth/login', { email, password });
}

export function logout() {
  return post('/api/auth/logout');
}

export function facebookAuth(userData: FacebookAuthUser): Promise<User> {
  return post<User>(
    '/api/auth/facebook',
    userData as any as Record<string, unknown>
  );
}

export function googleAuth(userData: GoogleAuthUser): Promise<User> {
  return post<User>(
    '/api/auth/google',
    userData as any as Record<string, unknown>
  );
}

export function signup(
  name: string,
  email: string,
  password: string,
  passwordRepeat: string
) {
  return post('/api/auth/signup', {
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
